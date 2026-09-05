import { createKridgeElizaPlugin } from "../sdk/adapters/eliza_adapter";

const plugin = createKridgeElizaPlugin({ apiKey: "krdg_live_demo" });
console.log("ElizaOS Plugin loaded:", plugin.name);
