// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KridgeHyperlaneReceiver
 * @notice EVM Cross-Chain Receiver for Kridge (deployed on Base & zkSync Era).
 * Allows users to initiate API credit rentals and donations using native USDC/ETH
 * and dispatches the execution intent to the GenLayer Intelligent Contract via Hyperlane Mailbox.
 */

interface IMailbox {
    function dispatch(
        uint32 _destinationDomain,
        bytes32 _recipientAddress,
        bytes calldata _messageBody
    ) external payable returns (bytes32 messageId);
    
    function process(
        bytes calldata _metadata,
        bytes calldata _message
    ) external;
}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract KridgeHyperlaneReceiver {
    address public owner;
    IMailbox public mailbox;
    uint32 public genlayerDomainId;
    bytes32 public genlayerKridgeContract;
    address public usdcToken;
    address public treasuryAddress;
    
    event RentalDispatched(bytes32 indexed messageId, address indexed buyer, uint256 listingId, uint256 amountUsd);
    event DonationDispatched(bytes32 indexed messageId, address indexed donor, uint256 quotaTokens);
    event SettlementExecuted(address indexed recipient, uint256 amountUsd);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(
        address _mailbox,
        uint32 _genlayerDomainId,
        bytes32 _genlayerKridgeContract,
        address _usdcToken,
        address _treasuryAddress
    ) {
        owner = msg.sender;
        mailbox = IMailbox(_mailbox);
        genlayerDomainId = _genlayerDomainId;
        genlayerKridgeContract = _genlayerKridgeContract;
        usdcToken = _usdcToken;
        treasuryAddress = _treasuryAddress;
    }
    
    /**
     * @notice Initiates a rental from Base or zkSync to GenLayer
     */
    function rentCreditCrossChain(
        uint256 listingId,
        uint256 amountUsd,
        uint32 durationHours
    ) external payable returns (bytes32 messageId) {
        if (amountUsd > 0 && usdcToken != address(0)) {
            IERC20(usdcToken).transferFrom(msg.sender, address(this), amountUsd);
        }
        
        bytes memory payload = abi.encode(
            "RENT",
            msg.sender,
            listingId,
            amountUsd,
            durationHours,
            block.chainid
        );
        
        messageId = mailbox.dispatch{value: msg.value}(
            genlayerDomainId,
            genlayerKridgeContract,
            payload
        );
        
        emit RentalDispatched(messageId, msg.sender, listingId, amountUsd);
    }
    
    /**
     * @notice Initiates a credit donation from Base or zkSync to GenLayer
     */
    function donateCreditCrossChain(
        string calldata provider,
        uint256 quotaTokens,
        string calldata encryptedKeyRef
    ) external payable returns (bytes32 messageId) {
        bytes memory payload = abi.encode(
            "DONATE",
            msg.sender,
            provider,
            quotaTokens,
            encryptedKeyRef,
            block.chainid
        );
        
        messageId = mailbox.dispatch{value: msg.value}(
            genlayerDomainId,
            genlayerKridgeContract,
            payload
        );
        
        emit DonationDispatched(messageId, msg.sender, quotaTokens);
    }
    
    /**
     * @notice Handles Hyperlane incoming settlement from GenLayer
     */
    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _body
    ) external {
        require(msg.sender == address(mailbox), "Unauthorized mailbox");
        require(_origin == genlayerDomainId, "Invalid origin domain");
        require(_sender == genlayerKridgeContract, "Invalid sender contract");
        
        (string memory action, address recipient, uint256 amount) = abi.decode(_body, (string, address, uint256));
        
        if (keccak256(bytes(action)) == keccak256(bytes("PAYOUT")) || keccak256(bytes(action)) == keccak256(bytes("REFUND"))) {
            if (amount > 0 && usdcToken != address(0)) {
                IERC20(usdcToken).transfer(recipient, amount);
            }
            emit SettlementExecuted(recipient, amount);
        }
    }
}