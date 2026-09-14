import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const privateKey = process.env.PRIVATE_KEY || process.argv[2];
  if (!privateKey) {
    console.error("Error: Please provide a private key via PRIVATE_KEY env var or as an argument.");
    process.exit(1);
  }

  const cleanKey = privateKey.trim().startsWith("0x") ? privateKey.trim() : "0x" + privateKey.trim();
  const rpcUrl = process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org";
  
  console.log("Connecting to Base Sepolia via:", rpcUrl);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(cleanKey, provider);
  
  console.log("Deployer Wallet Address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet Balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("Error: Deployer wallet has 0 ETH on Base Sepolia. Please fund it with testnet ETH.");
    process.exit(1);
  }

  const compiled = JSON.parse(fs.readFileSync("scripts/compiled_contract.json", "utf8"));
  const factory = new ethers.ContractFactory(compiled.abi, compiled.bytecode, wallet);

  // Constructor arguments with valid EIP-55 checksums
  const mailbox = ethers.getAddress("0x8B7E9F90aA2A944C3c57D7A04E85817AcFF0B6E6".toLowerCase());
  const genlayerDomainId = 61997;
  const genlayerContractBytes32 = "0x000000000000000000000000C54DCDCBeB99E5773693F894285756E78EdAf242";
  const usdcToken = ethers.getAddress("0x036CbD53842c5426634e7929541eC2318f3dCF7e".toLowerCase());
  const treasuryAddress = ethers.getAddress(wallet.address.toLowerCase());

  console.log("\nDeploying KridgeHyperlaneReceiver to Base Sepolia...");
  console.log("Parameters:");
  console.log("  - Mailbox:", mailbox);
  console.log("  - GenLayer Domain ID:", genlayerDomainId);
  console.log("  - GenLayer Contract:", genlayerContractBytes32);
  console.log("  - USDC Token:", usdcToken);
  console.log("  - Treasury Address:", treasuryAddress);

  const contract = await factory.deploy(
    mailbox,
    genlayerDomainId,
    genlayerContractBytes32,
    usdcToken,
    treasuryAddress
  );

  console.log("Deployment transaction sent! Tx hash:", contract.deploymentTransaction().hash);
  console.log("Waiting for confirmation on Base Sepolia...");
  
  await contract.waitForDeployment();
  const deployedAddress = await contract.getAddress();

  console.log("\n========================================================");
  console.log("🎉 SUCCESS! KridgeHyperlaneReceiver deployed at:");
  console.log(deployedAddress);
  console.log("Explorer Link: https://sepolia.basescan.org/address/" + deployedAddress);
  console.log("========================================================\n");

  // Update deploy_config.json
  const configPath = "contracts/deploy_config.json";
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (config.networks && config.networks["base-sepolia"]) {
      config.networks["base-sepolia"].contracts.KridgeHyperlaneReceiver = deployedAddress;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log("Updated contracts/deploy_config.json with new contract address.");
    }
  }

  // Update .env.local
  const envPath = ".env.local";
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    envContent = envContent.replace(
      /NEXT_PUBLIC_BASE_SEPOLIA_RECEIVER="[^"]*"/,
      `NEXT_PUBLIC_BASE_SEPOLIA_RECEIVER="${deployedAddress}"`
    );
    fs.writeFileSync(envPath, envContent);
    console.log("Updated .env.local with new contract address.");
  }
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
