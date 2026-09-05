# Developer Quickstart

```bash
npm install kridge-agent-sdk
```

```typescript
import { KridgeAgentSDK } from "kridge-agent-sdk";
const sdk = new KridgeAgentSDK({ apiKey: "krdg_live_..." });
const res = await sdk.chat({ model: "gpt-4o", messages: [{ role: "user", content: "Hello" }] });
```
