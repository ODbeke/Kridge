/**
 * ElizaOS Agent Runtime Integration with Kridge
 */
import { KridgeAgentClient } from "../kridge-agent-sdk";

async function main() {
  const client = new KridgeAgentClient({
    gatewayUrl: "http://localhost:3000"
  });

  console.log("Discovering available AI credit listings on Kridge...");
  const listings = await client.discoverListings({ type: "ALL" });
  console.log(`Found ${listings.length} active capacity pools.`);

  // Acquire first available capacity pool
  if (listings.length > 0) {
    const session = await client.acquireCapacity(listings[0].id, 24);
    console.log("Acquired ephemeral sub-key:", session.subKey);
  }
}

main().catch(console.error);