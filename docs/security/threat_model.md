# Kridge Security Threat Model

- **Key Isolation**: Master keys never leave memory enclaves.
- **HMAC Audit Proofs**: Every streamed chunk is signed to prevent fraud.
- **Sybil Resistance**: $1 anti-spam bond prevents DDoS dispute attacks.
