# ⚡ Kridge — Decentralized AI API Credit Marketplace & Public Compute Faucet

> **Stop wasting unused AI subscriptions. Rent or donate expiring API quota to developers and autonomous AI agents. Powered by GenLayer Intelligent Contracts and Hyperlane.**

[![GenLayer Hackathon](https://img.shields.io/badge/GenLayer-Intelligent%20Contracts-7928CA?style=for-the-badge&logo=python)](https://genlayer.com)
[![Multi-Chain Hyperlane](https://img.shields.io/badge/Hyperlane-Base%20%7C%20zkSync%20%7C%20Solana-00F2FE?style=for-the-badge)](https://hyperlane.xyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)

---

## 🚩 The Problem: Billions in Expiring AI Subscriptions

Every month, millions of developers and enterprise teams pay for AI API subscriptions they never fully use (Claude Pro/Team, OpenAI Scale/Pro, Gemini Advanced, Groq, DeepSeek).

- **53% of SaaS licenses** go unused or underutilized across enterprises.
- The average enterprise wastes **$18M–$21M annually** on idle shelfware quota.
- On the other side, indie developers, weekend builders, students, and autonomous AI agents desperately need access to top-tier models but cannot justify full monthly subscriptions for intermittent workloads.

**Kridge is the world's first decentralized marketplace connecting these two sides—turning dead, expiring waste into liquid yield for sellers and discounted compute for buyers.**

---

## 🧠 Why This Needs Blockchain. And Why It Needs GenLayer.

Traditional blockchains (Ethereum, Solana, Polygon) can verify basic token transfers, but they **cannot verify live web conditions**:
- *Is this API key valid and unbanned right now?*
- *Does the key still have quota left?*
- *Did the seller revoke access mid-rental session?*

### GenLayer Intelligent Contracts Solve the Fundamental Trust Barrier:

1. **Live Validator Web Probing (`gl.get_web_data`)**:
   GenLayer AI validators independently query provider endpoints (OpenAI, Anthropic, Gemini, Groq) to test key health, rate limits, and model access in real-time before and during rental escrow.
2. **Subjective AI Dispute Arbitration (`gl.exec_prompt`)**:
   When disputes occur, AI validators read cryptographic gateway logs and error traces, applying LLM reasoning to reach consensus on fault.
3. **Optimistic Democracy Escalation**:
   Contested verdicts automatically escalate to larger validator juries for progressive, tamper-proof consensus.

---

## 🔒 Security & The Virtual Sub-Key Pattern

To guarantee 100% security for both parties, **the buyer never sees the seller's raw API key (`sk-...`)**:
1. Seller registers their key into the secure Kridge Vault.
2. Kridge issues an isolated, ephemeral **Virtual Sub-Key (`krdg_live_...`)** with strict hard quota limits, rate caps, and time-to-live expiration.
3. Buyer makes standard API calls to `http://localhost:3000/api/proxy/v1/chat/completions`.
4. The gateway meters tokens in real-time, forwards with the vaulted key, and streams back responses.

---

## 🎁 Dual Listing Modes: Rent vs. Donate

Sellers have two flexible choices when listing expiring credits:
- 💵 **Rent for Yield**: Seller sets a custom price (typically 60%–75% discount vs. retail). Upon rental completion, **95% is paid to the seller** and **5% protocol fee routes to the Kridge Treasury**.
- 🎁 **Donate for Free ($0.00)**: Compute is added to the **Community AI Faucet & Agent Pool**. Donors receive on-chain **ESG Proof-of-Donation Badges** tracking total dollars rescued.

### 🏆 The 6-Tier On-Chain Impact Badge System:
- 🌲 **Wood Tier**: $50+ rescued
- 🥉 **Bronze Tier**: $250+ rescued
- 🥈 **Silver Tier**: $1,000+ rescued
- 🥇 **Gold Tier**: $5,000+ rescued
- 💎 **Diamond Tier**: $10,000+ rescued
- 👑 **Platinum Sovereign**: $20,000+ rescued

---

## ⚖️ Protocol Economics & Dispute Resolution

- **5% Marketplace Take Rate**: Auto-deducted upon escrow completion.
- **$1.00 Anti-Spam Dispute Bond**:
  - **Valid Claim (Seller fault / revoked key)**: Buyer receives **100% rental refund + 100% of the $1.00 bond back**.
  - **False / Frivolous Claim**: **50% of the $1.00 bond ($0.50) is slashed to the Kridge Treasury**, and **50% ($0.50) is refunded**.

---

## 🤖 Built for the Agentic Economy (x402 Protocol)

Autonomous AI agents (LangChain, CrewAI, AutoGPT, ElizaOS) can discover and consume compute programmatically:

```python
from openai import OpenAI

# 1-Line Drop-in Integration with Kridge Proxy Gateway
client = OpenAI(
    api_key="krdg_live_demo_claude_9a8f4c1e7b2d",
    base_url="http://localhost:3000/api/proxy/v1"
)

response = client.chat.completions.create(
    model="claude-3-5-sonnet",
    messages=[{"role": "user", "content": "Hello Kridge!"}]
)
print(response.choices[0].message.content)
```

### Agentic REST Endpoints:
- `GET /api/agent/listings?type=ALL`: Machine-readable catalog of active paid & free compute.
- `POST /api/agent/rent`: Autonomous escrow checkout returning instant sub-keys.

---

## 🚀 Quickstart & Local Installation

```bash
# 1. Clone repository
git clone https://github.com/ODbeke/Kridge.git
cd Kridge

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the marketplace, test live proxy prompts, and simulate AI validator consensus.

---

## 📁 Repository Structure

```
KRIDGE/
├── contracts/
│   ├── kridge_marketplace.py         # GenLayer Intelligent Contract (Python)
│   ├── mock_genlayer_simulator.py    # Local validator consensus & test runner
│   ├── deploy_config.json            # Base, zkSync, Solana & GenLayer addresses
│   └── hyperlane/
│       ├── KridgeHyperlaneReceiver.sol # EVM receiver for Base & zkSync Era
│       └── kridge_solana_program.rs    # SVM program for Solana Sealevel
├── gateway/
│   ├── proxy_service.ts              # Virtual session manager & token meter
│   ├── providers.ts                  # Provider rate cards & test endpoints
│   └── audit_logger.ts               # Cryptographic HMAC audit receipts
├── sdk/
│   ├── kridge-agent-sdk.ts           # TypeScript SDK for AI Agents
│   ├── kridge_agent.py               # Python SDK for LangChain & CrewAI
│   └── examples/                     # LangChain, CrewAI, and ElizaOS examples
└── src/
    ├── app/
    │   ├── page.tsx                  # Landing Page & Live Waste Ticker
    │   ├── explore/page.tsx          # Marketplace (For Rent vs Free/Donated)
    │   ├── sell/page.tsx             # Seller & ESG Donation Studio
    │   ├── playground/page.tsx       # Live Proxy Console & Key Manager
    │   ├── tribunal/page.tsx         # GenLayer AI Courtroom Visualizer
    │   ├── impact/page.tsx           # ESG Badges & Hall of Fame
    │   ├── agentic/page.tsx          # Autonomous Agent Economy Hub
    │   ├── bridge/page.tsx           # Hyperlane Interchain Relayer
    │   └── docs/page.tsx             # Technical Documentation & Whitepaper
    └── styles/
        └── globals.css               # Tailwind CSS & Cyber Glow styles
```

---

## 📄 License
MIT License. Built with ❤️ for the GenLayer Hackathon.