// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IKridgeMarketplace {
    function initiateRental(bytes32 listingId, uint256 tokensRequested) external payable returns (bytes32 rentalId);
    function settleRental(bytes32 rentalId, uint256 tokensConsumed) external;
    function fileDispute(bytes32 rentalId, string calldata reason) external payable;
}
