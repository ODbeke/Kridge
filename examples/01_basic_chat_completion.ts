import { KridgeAgentSDK } from "../sdk/kridge-agent-sdk";

async function main() {
  const sdk = new KridgeAgentSDK({ apiKey: process.env.KRIDGE_API_KEY || "krdg_live_demo" });
  const response = await sdk.chat({
    model: "gpt-4o",
    messages: [{ role: "user", content: "Explain decentralized AI compute." }]
  });
  console.log("Response:", response);
}
main();
