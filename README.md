# ⚡ Kridge — Decentralized AI API Quota Marketplace & Intelligent Compute Faucet

> **Monetize unused AI subscriptions, access frontier models at 60%–80% discounts, or donate expiring compute to autonomous agents and open-source builders. Powered by GenLayer Intelligent Contracts, Optimistic Democracy, and Hyperlane.**

[![GenLayer Hackathon](https://img.shields.io/badge/GenLayer-Intelligent%20Contracts-7928CA?style=for-the-badge&logo=python)](https://genlayer.com)
[![Multi-Chain Hyperlane](https://img.shields.io/badge/Hyperlane-Base%20%7C%20zkSync%20%7C%20Solana-00F2FE?style=for-the-badge)](https://hyperlane.xyz)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)

---

## 📑 Table of Contents

- [The Problem: The Expiring AI Subscription Crisis](#-the-problem-the-expiring-ai-subscription-crisis)
- [The Solution: Kridge Secondary Compute Marketplace](#-the-solution-kridge-secondary-compute-marketplace)
- [Rental Format vs. Legacy Per-Call Metering](#-rental-format-vs-legacy-per-call-metering)
- [Seller Safe Capacity & Quota Estimation](#-seller-safe-capacity--quota-estimation)
- [Why GenLayer Intelligent Contracts?](#-why-genlayer-intelligent-contracts)
- [Security: The Virtual Sub-Key Architecture](#-security-the-virtual-sub-key-architecture)
- [Dual Listing Modes: Rent vs. Donate](#-dual-listing-modes-rent-vs-donate)
- [Protocol Economics & Dispute Resolution](#-protocol-economics--dispute-resolution)
- [Multi-Chain Architecture & Seamless Network Switching](#-multi-chain-architecture--seamless-network-switching)
- [Autonomous Agentic Economy (x402 Protocol)](#-autonomous-agentic-economy-x402-protocol)
- [Application Tour & Page Directory](#-application-tour--page-directory)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Smart Contracts & Codebase Layout](#-smart-contracts--codebase-layout)
- [Quickstart & Local Development](#-quickstart--local-development)
- [Testing the GenLayer Intelligent Contract](#-testing-the-genlayer-intelligent-contract)
- [Hackathon Track Alignment](#-hackathon-track-alignment)
- [License](#-license)

---

## 🚩 The Problem: The Expiring AI Subscription Crisis

Every month, millions of developers, researchers, and enterprises subscribe to frontier AI platforms (OpenAI Scale/Pro, Anthropic Claude Team/Max, Google Gemini Advanced, Groq Cloud, DeepSeek). 

However, AI API consumption is inherently non-linear and bursty:
- **53% of enterprise SaaS licenses** go underutilized or completely idle each billing cycle.
- The average enterprise bleeds **$18M–$21M annually** on idle "shelfware" compute quotas that reset to zero at month's end.
- Individual developers and startups frequently pay for Tier-4/Tier-5 rate limits to handle intermittent peaks, leaving hundreds of millions of monthly tokens unspent.

On the other side of the market:
- **Indie developers, students, and weekend builders** are priced out of top-tier models like `claude-3-5-sonnet` or `gpt-4o` because they cannot commit to $200–$500/month enterprise plans.
- **Autonomous AI agents** (running LangChain, CrewAI, AutoGPT, or ElizaOS) require on-demand, programmatic compute without needing a human to manually enter a credit card.

**Kridge bridges these two sides:** turning dead, expiring API waste into liquid yield for sellers and accessible, discounted compute for buyers and autonomous agents.

---

## 💡 The Solution: Kridge Secondary Compute Marketplace

Kridge is the world's first decentralized compute escrow marketplace that allows holders of underutilized API keys to package their surplus quota into secure, escrow-backed compute allotments.

```
+-----------------------------------------------------------------------------+
|                                KRIDGE PROTOCOL                              |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [ SELLER ] (Idle Tier-4 Key)                                               |
|      │                                                                      |
|      ▼                                                                      |
|  1. Safe Capacity Estimation & Health Probe (/api/probe)                   |
|      │                                                                      |
|      ▼                                                                      |
|  2. Master Key Encrypted in Kridge Vault (sk-... never exposed)             |
|      │                                                                      |
|      ▼                                                                      |
|  3. GenLayer Intelligent Escrow (contracts/kridge_marketplace.py)           |
|      │                                                                      |
|      ├──────────────────────────────┬───────────────────────────────┐       |
|      ▼                              ▼                               ▼       |
|  [ RENT FOR YIELD ]         [ DONATE COMPUTE ]           [ MULTI-CHAIN ]    |
|  60%-80% Discount           Community AI Faucet          Base / zkSync /    |
|  95% Payout to Seller       Proof-of-Donation Badges     Solana / GenLayer  |
|  5% Protocol Fee            Public Good for Agents       via Hyperlane      |
|      │                              │                               │       |
|      └──────────────────────────────┴───────────────────────────────┘       |
|                                     │                                       |
|                                     ▼                                       |
|  [ BUYER / AGENT ]                                                          |
|  - Receives Ephemeral Virtual Sub-Key: krdg_live_xxxxxxxxxxxx               |
|  - Queries Kridge Secure Proxy: http://.../api/proxy/v1                     |
|  - Real-Time Token Metering, Session Caps & Cryptographic HMAC Receipts     |
|  - Upstream Dispute? GenLayer AI Tribunal Arbitrates via gl.exec_prompt     |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## ⏱️ Rental Format vs. Legacy Per-Call Metering

A core architectural decision in Kridge is using a **Rental Quota Block Format** rather than legacy micro-metered pay-per-call:

| Feature | Legacy Pay-Per-Call | Kridge Rental Quota Format | Why It Matters |
| :--- | :--- | :--- | :--- |
| **Settlement Model** | Micro-transactions per HTTP request | Fixed quota package locked in escrow | Eliminates excessive blockchain gas fees and network congestion. |
| **Buyer Budget Certainty** | Variable / unpredictable monthly bill | Deterministic upfront price for fixed token volume | Developers know exact budget limits before executing heavy workloads. |
| **Seller Yield Guarantee** | Volatile drip payments subject to demand | Guaranteed locked payment released upon session completion | Sellers know exactly how much they earn for reserving quota. |
| **Session Guarantees** | No SLA; rate-limits can hit at any time | Dedicated session caps & reserved rate headroom | Protects buyers from rate-limit exhaustion during batch runs. |
| **Arbitration Scope** | Thousands of micro-claims impossible to arbitrate | Clean session-level cryptographic audit trails | GenLayer AI validators arbitrate the complete session dispute deterministically. |

Buyers select a listing with a defined **allocated token quota** (e.g., 500,000 tokens) and **session duration** (e.g., 24 hours, 48 hours, or 7 days). Upon payment into the GenLayer escrow, the buyer immediately receives a dedicated virtual sub-key.

---

## 📊 Seller Safe Capacity & Quota Estimation

Sellers frequently ask: *“If I list my key, how do I know the exact capacity being sold so I don’t hurt my own apps or risk my account?”*

Kridge implements a comprehensive **Safe Capacity Estimation & Quota Isolation System**:

1. **Automated Endpoint Probing (`/api/probe`)**:
   - Before any key can be listed, Kridge sends an isolated validation probe to the provider's test endpoint (e.g. Anthropic `/v1/models` or OpenAI `/v1/models`).
   - Verifies key validity, organization tier, model access permissions, and baseline latency.
2. **Headroom & Rate-Limit Analysis**:
   - The seller specifies their total monthly subscription budget or provider tier (Tier 1–Tier 5).
   - Kridge displays recommended safe sellable capacity, ensuring the seller retains at least 25%–50% of their Tokens-Per-Minute (TPM) and Requests-Per-Minute (RPM) limits for personal use.
3. **Strict Session Hard-Capping**:
   - When a buyer rents a 500,000 token package, the Kridge Proxy enforces a hard token ceiling. Once the allocated tokens are consumed, the virtual sub-key is automatically marked `EXHAUSTED` and severed.
   - The seller’s master upstream key is never exposed to runaway billing or abuse.
4. **Time-To-Live (TTL) Auto-Revocation**:
   - Each rental session has an explicit timestamp expiration. When the time expires, the virtual key is deactivated regardless of whether unused tokens remain.

---

## 🧠 Why GenLayer Intelligent Contracts?

Traditional blockchains (Ethereum, Solana, Polygon) execute deterministic, sandboxed bytecode. They **cannot access the live internet**, verify HTTP status codes, or interpret semantic context.

Kridge requires three capabilities that only **GenLayer Intelligent Contracts** make possible:

### 1. Decentralized Validator Web Probing (`gl.get_web_data`)
Before locking buyer funds in escrow or listing a key, GenLayer validators independently query provider endpoints across the open web.
- If a seller’s API key has been cancelled, banned, or exhausted upstream, validators reach consensus on the failure and reject the listing on-chain without relying on centralized oracles.

### 2. Subjective AI Dispute Arbitration (`gl.exec_prompt`)
If an upstream provider revokes a key mid-session or throws unexpected `HTTP 401 / 429` errors:
- The buyer or gateway submits the cryptographic HMAC audit receipt and raw error trace.
- GenLayer AI validators run `gl.exec_prompt` using multi-LLM consensus to read the error logs, assess whether the fault lies with the seller (revoked key / expired account) or the buyer (malformed prompt / prompt injection), and render an on-chain verdict.

### 3. Optimistic Democracy Consensus
GenLayer’s **Optimistic Democracy** ensures that uncontested sessions settle instantly with minimal overhead, while disputed sessions automatically escalate to a multi-validator jury for progressive, tamper-resistant adjudication.

---

## 🔒 Security: The Virtual Sub-Key Architecture

The buyer **NEVER** receives the seller’s raw API key (`sk-ant-...` or `sk-proj-...`). All interactions route through the **Kridge Secure Proxy Gateway**:

```
+---------------+        1. API Request with Virtual Key         +----------------------+
| Buyer / Agent | ─────────────────────────────────────────────> | Kridge Proxy Gateway |
+---------------+      Header: Authorization: Bearer krdg_live_..+----------------------+
                                                                    │
                                                                    ├─ 2. Validate Session in Escrow
                                                                    ├─ 3. Enforce Token Metering & Hard Cap
                                                                    ├─ 4. Generate HMAC-SHA256 Audit Log
                                                                    │
                                                                    ▼
                                                         +----------------------+
                                                         | Provider API Vault   |
                                                         | (Injects sk-...)     |
                                                         +----------------------+
                                                                    │
                                                                    ▼
                                                         +----------------------+
                                                         | OpenAI / Anthropic / |
                                                         | Gemini / Groq Cloud  |
                                                         +----------------------+
```

1. **Vault Encryption**: The seller’s master key is encrypted at rest using AES-256-GCM.
2. **Ephemeral Sub-Keys**: The buyer receives a unique sub-key prefix (`krdg_live_[hex]`).
3. **Streaming Token Metering**: Every request and completion chunk is metered in real-time.
4. **HMAC Cryptographic Receipts**: Every call generates a signed receipt containing timestamp, latency, status code, prompt tokens, and completion tokens. This serves as tamper-evident evidence in the event of an AI Tribunal dispute.

---

## 🎁 Dual Listing Modes: Rent vs. Donate

Sellers have two primary motivations for listing unused quota:

### 1. Rent for Yield (Monetization)
- Seller sets a discounted price (typically 60%–80% lower than retail provider pricing).
- Enables developers to access cheap frontier models.
- **Payout Split**: **95%** paid directly to the seller’s wallet upon session completion; **5%** protocol fee routes to the Kridge Treasury.

### 2. Donate for Free ($0.00) — Community AI Faucet
- Philanthropists and enterprises donate expiring subscription quota to the **Kridge Public Compute Faucet**.
- Open-source developers, students, and autonomous AI agents can claim free compute quotas without paying.
- Donors earn permanent on-chain **ESG Impact Badges** tracking the cumulative dollar value of rescued compute.

### 🏆 6-Tier On-Chain Impact Badge System:
- 🌲 **Wood Tier**: $50+ rescued compute
- 🥉 **Bronze Tier**: $250+ rescued compute
- 🥈 **Silver Tier**: $1,000+ rescued compute
- 🥇 **Gold Tier**: $5,000+ rescued compute
- 💎 **Diamond Tier**: $10,000+ rescued compute
- 👑 **Platinum Sovereign**: $20,000+ rescued compute

---

## ⚖️ Protocol Economics & Dispute Resolution

To prevent marketplace spam and bad-faith disputes, Kridge enforces mathematical incentive alignment:

```
                                [ RENTAL SESSION ESCROW ]
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
          [ Successful Session ]                           [ Dispute Initiated ]
                    │                                      (Requires $1.00 Bond)
         ┌──────────┴──────────┐                                    │
         ▼                     ▼                                    ▼
     95% Payout            5% Protocol Fee                 [ GenLayer AI Tribunal ]
     to Seller             to Kridge Treasury                       │
                                                   ┌────────────────┴────────────────┐
                                                   ▼                                 ▼
                                            [ Valid Claim ]                  [ Frivolous Claim ]
                                            - 100% Refund to Buyer           - 50% ($0.50) Slashed to Treasury
                                            - 100% of $1.00 Bond Returned    - 50% ($0.50) Returned
                                            - Seller Penalized               - Seller Receives Session Payout
```

- **Marketplace Take Rate**: 5.0% auto-deducted upon successful escrow completion.
- **Anti-Spam Dispute Bond**: $1.00 USDC.
  - **Valid Claim** (e.g. key invalidated upstream, 401 error, revoked by seller): Buyer receives a **100% refund of the rental fee + 100% of the $1.00 dispute bond**.
  - **Frivolous Claim** (e.g. buyer attempting to claim refund after consuming quota): **50% of the bond ($0.50) is slashed to the Kridge Treasury**, and **50% ($0.50) is returned**.

---

## 🌐 Multi-Chain Architecture & Seamless Network Switching

Kridge is built for multi-chain accessibility. Users and agents on any supported network can interact with Kridge without fragmentation:

| Network | Chain ID / Type | Role in Kridge Protocol |
| :--- | :--- | :--- |
| **Base** | `8453` (EVM) | Primary consumer & seller onboarding; low-cost USDC payments. |
| **zkSync Era** | `324` (ZK-EVM) | High-speed ZK rollups for enterprise compute batch settlement. |
| **GenLayer** | `genlayer-1` / Testnet | Core Intelligent Contract execution, web probing (`gl.get_web_data`), and AI Tribunal arbitration. |
| **Solana** | Devnet / Mainnet (SVM) | High-throughput autonomous agent escrow checkout and sub-key issuance. |

### In-App Wallet Network Switching
Kridge includes native EVM network auto-switching via `wallet_switchEthereumChain` and `wallet_addEthereumChain`. When switching between Base, zkSync, and GenLayer in the header dropdown, the connected Web3 wallet (MetaMask, Coinbase Wallet, Rabby) prompts the user to switch networks with zero friction.

Cross-chain state updates and escrow confirmations are relayed across chains via **Hyperlane Mailbox** (`KridgeHyperlaneReceiver.sol`).

---

## 🤖 Autonomous Agentic Economy (x402 Protocol)

Kridge is built from the ground up for the machine-to-machine economy. AI agents can autonomously discover, evaluate, rent, and consume compute without human intervention.

### 1-Line Drop-In SDK Integration
The Kridge Proxy Gateway is 100% OpenAI-API-compatible. To route any agent library through Kridge, simply update the `base_url`:

```python
from openai import OpenAI

# Drop-in replacement: point OpenAI SDK to Kridge Gateway
client = OpenAI(
    api_key="krdg_live_demo_claude_9a8f4c1e7b2d",  # Virtual Sub-Key
    base_url="http://localhost:3000/api/proxy/v1"
)

response = client.chat.completions.create(
    model="claude-3-5-sonnet",
    messages=[{"role": "user", "content": "Analyze these smart contract logs for vulnerabilities."}]
)

print(response.choices[0].message.content)
```

### Programmatic REST Endpoints for Autonomous Agents:
- **`GET /api/agent/listings?type=ALL`**: Returns a machine-readable JSON catalog of active paid compute and free public faucets, including available tokens, provider, model family, price, and latency.
- **`POST /api/agent/rent`**: Allows an agent wallet to programmatically fund an escrow session and immediately receive a virtual sub-key in the HTTP response.
- **`POST /api/proxy/v1/chat/completions`**: Universal streaming chat completions proxy with automatic token metering.

---

## 🖥️ Application Tour & Page Directory

| Route | Page Name | Purpose & Highlights |
| :--- | :--- | :--- |
| **`/`** | **Landing Page** | Live subscription waste ticker, interactive ROI calculator, problem breakdown, and multi-chain architecture overview. |
| **`/explore`** | **Marketplace Hub** | High-density terminal interface featuring real-time stats ticker (`ACTIVE_QUOTAS` & `COMPUTE_POOL`), network switcher, mode toggles (`RENT` / `SELL`), capability filters, and one-click escrow rental. |
| **`/sell`** | **Seller & ESG Studio** | Wizard for listing keys. Includes one-click live provider health probing (`/api/probe`), quota sliders, pricing calculator, and ESG donation mode. |
| **`/playground`** | **Live Proxy Console** | Interactive test console to send prompts through virtual sub-keys, inspect streaming responses, and observe real-time latency and token deductions. |
| **`/tribunal`** | **GenLayer AI Courtroom** | Real-time visualizer of GenLayer AI validator jury deliberations, cryptographic log analysis, and dispute resolution verdicts. |
| **`/impact`** | **ESG Hall of Fame** | On-chain registry of donors, total rescued compute volume, and interactive 6-tier Impact Badges. |
| **`/agentic`** | **Agent Hub** | Developer hub with code snippets, x402 protocol specification, and LangChain/CrewAI/ElizaOS SDK setup. |
| **`/bridge`** | **Hyperlane Relayer** | Multi-chain interchain bridge status connecting Base, zkSync Era, GenLayer, and Solana. |
| **`/docs`** | **Documentation** | Whitepaper, intelligent contract specifications, and API reference. |

---

## 📐 System Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor Seller
    actor Buyer as Buyer / Agent
    participant Web3 as User Wallet
    participant Frontend as Kridge UI (/explore)
    participant Gateway as Kridge Proxy Gateway
    participant GenLayer as GenLayer Intelligent Contract
    participant Provider as Upstream AI Provider (OpenAI/Anthropic)

    Seller->>Frontend: List Key (sk-...) + Quota Allocation
    Frontend->>Gateway: POST /api/probe (Test Key Validity)
    Gateway->>Provider: Validate HTTP Status & Model Access
    Provider-->>Gateway: 200 OK (Latency: 140ms)
    Gateway-->>Frontend: Verification Success
    Seller->>GenLayer: create_listing() with Vault Reference
    GenLayer->>GenLayer: gl.get_web_data (Validator Consensus)
    GenLayer-->>Frontend: Listing #N Active on Marketplace

    Buyer->>Frontend: Select Listing & Choose Rental Duration
    Buyer->>Web3: Sign Escrow Deposit (Base / zkSync / Solana)
    Web3->>GenLayer: rent_listing() (USDC locked in escrow)
    GenLayer->>Gateway: Issue Ephemeral Virtual Key (krdg_live_...)
    Gateway-->>Buyer: Return Virtual Sub-Key

    Buyer->>Gateway: POST /api/proxy/v1/chat/completions
    Gateway->>Gateway: Verify Escrow Status & Quota Headroom
    Gateway->>Provider: Forward Request with Vaulted Master Key
    Provider-->>Gateway: Stream Response Tokens
    Gateway->>Gateway: Deduct Tokens & Sign HMAC Audit Receipt
    Gateway-->>Buyer: Stream Response to Buyer / Agent

    alt Normal Completion
        Buyer->>GenLayer: complete_rental()
        GenLayer->>Seller: Release 95% Payout
        GenLayer->>GenLayer: Route 5% Fee to Treasury
    else Dispute (e.g. Seller Revokes Key Upstream)
        Buyer->>GenLayer: file_dispute() (with $1.00 Bond + Audit Receipt)
        GenLayer->>GenLayer: gl.exec_prompt (Validators inspect error trace)
        GenLayer-->>Buyer: 100% Refund + $1.00 Bond Returned
    end
```

---

## 📦 Smart Contracts & Codebase Layout

```
KRIDGE/
├── contracts/
│   ├── kridge_marketplace.py         # Primary GenLayer Intelligent Contract (Python)
│   ├── mock_genlayer_simulator.py    # Local multi-validator consensus & test simulator
│   ├── deploy_config.json            # Deployed contract addresses for Base, zkSync, Solana & GenLayer
│   └── hyperlane/
│       ├── KridgeHyperlaneReceiver.sol # EVM receiver contract for Base & zkSync Era
│       └── kridge_solana_program.rs    # SVM program for Solana Sealevel
├── gateway/
│   ├── proxy_service.ts              # Virtual session manager, hard caps, and proxy router
│   ├── providers.ts                  # Provider rate cards, model families, and test endpoints
│   └── audit_logger.ts               # Cryptographic HMAC-SHA256 audit logger
├── sdk/
│   ├── kridge-agent-sdk.ts           # TypeScript SDK for AI Agents and ElizaOS
│   ├── kridge_agent.py               # Python SDK for LangChain, AutoGPT, and CrewAI
│   └── examples/                     # Agentic integration examples
├── src/
│   ├── app/                          # Next.js App Router (All 9 application routes)
│   ├── components/                   # Modular UI components (Navigation, Modals, Cards)
│   ├── lib/                          # State store, Web3 connectors, and utility helpers
│   └── styles/                       # Global CSS & cyberpunk terminal design tokens
├── package.json                      # Project dependencies and build scripts
└── README.md                         # Protocol documentation
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm
- Python 3.10+ (for running contract simulations)

### 1. Clone the Repository
```bash
git clone https://github.com/ODbeke/Kridge.git
cd Kridge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment (Optional)
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GENLAYER_RPC=https://testnet.genlayer.network
```

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view Kridge locally.

---

## 🧪 Testing the GenLayer Intelligent Contract

Kridge includes a standalone Python test suite that simulates the full lifecycle of the GenLayer Intelligent Contract:

```bash
# Run simulator
python3 contracts/mock_genlayer_simulator.py
```

### Simulation Output Breakdown:
1. **Listing Creation**: Seller lists 500k Claude 3.5 Sonnet tokens for $4.00 (70% discount).
2. **Validator Web Probing**: GenLayer simulated nodes run `gl.get_web_data` to verify endpoint health.
3. **Donation Listing & Impact**: Philanthropist lists a $500 donation; verified and awarded ESG tier.
4. **Buyer Escrow Lock**: Buyer deposits $4.00 into escrow and receives an ephemeral sub-key.
5. **Dispute Arbitration**: Simulates upstream key revocation (`HTTP 401 Unauthorized`) and files a dispute with a $1.00 bond.
6. **AI Validator Consensus**: `gl.exec_prompt` executes LLM consensus across the error logs and issues a complete buyer refund.

---

## 🎯 Hackathon Track Alignment

Kridge was engineered specifically for the **GenLayer Hackathon**:

| GenLayer Capability | How Kridge Leverages It |
| :--- | :--- |
| **Intelligent Contracts (Python)** | The core marketplace logic is authored entirely as a native GenLayer Python contract (`contracts/kridge_marketplace.py`), handling listings, session caps, dynamic tier evaluations, and fee splits. |
| **Web Data Access (`gl.get_web_data`)** | Validators independently poll live AI provider APIs to confirm key validity, rate limit status, and endpoint health without centralized oracles. |
| **Subjective AI Consensus (`gl.exec_prompt`)** | The **Kridge AI Tribunal** uses LLM reasoning inside validator nodes to evaluate gateway logs and error traces, resolving disputes where deterministic code cannot decide fault. |
| **Optimistic Democracy** | Standard rental sessions resolve optimistically, while disputed sessions escalate automatically to validator juries. |
| **Cross-Chain Interoperability** | Combined with **Hyperlane**, Kridge brings GenLayer's intelligent contract intelligence to users on Base, zkSync Era, and Solana. |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built with ❤️ for the **GenLayer Hackathon**.
