"""
Kridge GenLayer Intelligent Contract Local Test Simulator
=========================================================
Runs simulated multi-validator consensus, web probing, and dispute LLM arbitration.
"""

import sys
import json

# Inject mock GenLayer SDK runtime if running locally outside GenLayer VM
if "genlayer" not in sys.modules:
    class MockStorage:
        class TreeMap(dict):
            def __init__(self, *args, **kwargs):
                super().__init__()
            def get(self, k, default=None):
                return super().get(k, default)

    class MockContract:
        def __init__(self):
            self.listings = MockStorage.TreeMap()
            self.rentals = MockStorage.TreeMap()
            self.disputes = MockStorage.TreeMap()
            self.donors = MockStorage.TreeMap()

    class MockNondet:
        @staticmethod
        def exec_prompt(p: str) -> str:
            return json.dumps({
                "verdict": "BUYER_REFUND",
                "confidence": 0.95,
                "reasoning": "Cryptographic error receipts show HTTP 401 Unauthorized from upstream provider."
            })

        @staticmethod
        def get_webpage(url: str, mode="text") -> str:
            return '{"status": "ok", "models": ["gpt-4o", "claude-3-5-sonnet"]}'

    class MockEqPrinciple:
        @staticmethod
        def strict_eq(fn):
            return fn()

    class MockSender:
        as_hex = "0xAgent_Charlie_77b9A"

    class MockMessage:
        sender_address = MockSender()

    class MockGL:
        storage = MockStorage()
        class contract:
            Contract = MockContract
        nondet = MockNondet()
        eq_principle = MockEqPrinciple()
        message = MockMessage()
        class public:
            @staticmethod
            def view(fn): return fn
            @staticmethod
            def write(fn): return fn

    import types
    mock_gl_module = types.ModuleType("genlayer")
    mock_gl_module.__dict__.update({
        "contract": MockGL.contract,
        "storage": MockGL.storage,
        "nondet": MockGL.nondet,
        "eq_principle": MockGL.eq_principle,
        "message": MockGL.message,
        "public": MockGL.public,
    })
    sys.modules["genlayer"] = mock_gl_module

    mock_types_module = types.ModuleType("genlayer.types")
    mock_types_module.__dict__.update({
        "Address": str,
        "u256": int,
        "TreeMap": MockStorage.TreeMap,
    })
    sys.modules["genlayer.types"] = mock_types_module

# Now import the contract
from kridge_marketplace import KridgeMarketplace

def run_simulation():
    print("==================================================")
    print("🚀 Initializing Kridge GenLayer Intelligent Contract...")
    print("==================================================")
    contract = KridgeMarketplace()
    contract.listings = MockStorage.TreeMap()
    contract.rentals = MockStorage.TreeMap()
    contract.disputes = MockStorage.TreeMap()
    contract.donors = MockStorage.TreeMap()

    # 1. Create a For Rent Listing
    print("\n[Step 1] Seller lists 500k tokens of Claude 3.5 Sonnet for $4.00 (400 cents)...")
    listing_id_1 = contract.create_listing(
        provider="anthropic",
        model_family="claude-3-5-sonnet",
        listing_type="RENT",
        quota_tokens=500000,
        price_usd_cents=400,
        expiry_timestamp=1757200000,
        encrypted_key_ref="enc_vault_ref_981a2b"
    )
    print(f"✅ Listing #{listing_id_1} created. Stored data:")
    print(contract.get_listing(listing_id_1))

    # 2. Validator Health Probing via Web
    print(f"\n[Step 2] GenLayer Validators execute gl.nondet.get_webpage on Listing #{listing_id_1}...")
    health = contract.verify_listing_health(listing_id_1)
    print(f"✅ Health verification result: {health}")

    # 3. Create a DONATION Listing
    print("\n[Step 3] Philanthropist creates a $500 AI Compute Donation (100M tokens GPT-4o)...")
    listing_id_2 = contract.create_listing(
        provider="openai",
        model_family="gpt4o",
        listing_type="DONATION",
        quota_tokens=100000000,
        price_usd_cents=0,
        expiry_timestamp=1757300000,
        encrypted_key_ref="enc_vault_ref_bob_gpt4o"
    )
    print(f"✅ Donation Listing #{listing_id_2} created. Retail ESG value credited.")

    # 4. Check Donor Profile
    donor_profile = contract.get_donor_profile("0xAgent_Charlie_77b9A")
    print(f"\n[Step 4] Charlie Donor Profile on GenLayer:\n{donor_profile}")

    # 5. Buyer Rents Listing
    print("\n[Step 5] Buyer (Agent) rents Listing #1 with 400 cents ($4.00) in Escrow...")
    rental_id = contract.rent_listing(
        listing_id=listing_id_1,
        duration_hours=24,
        sub_key_hash="krdg_live_hash_7781bc"
    )
    print(f"✅ Rental Session #{rental_id} initiated. Stored session:")
    print(contract.get_rental(rental_id))

    # 6. Dispute Filing
    print("\n[Step 6] Simulating Upstream Revocation (HTTP 401) & Dispute Filing with $1.00 Bond...")
    dispute_id = contract.file_dispute(
        rental_id=rental_id,
        reason="API Key was revoked upstream (401 Unauthorized)",
        error_trace="HTTP 401: Invalid API Key provided to Anthropic API",
        gateway_receipt="SIG_KRIDGE_GATEWAY_0x99281a"
    )
    print(f"✅ Dispute #{dispute_id} filed with $1.00 anti-spam bond.")

    # 7. GenLayer AI Validator Arbitration
    print("\n[Step 7] GenLayer AI Validators running gl.nondet.exec_prompt consensus...")
    verdict = contract.resolve_dispute(dispute_id)
    print(f"⚖️ GenLayer Arbitration Verdict: {verdict}")

    print("\n[Step 8] Final Market Statistics:")
    print(contract.get_market_stats())
    print("\n🎉 Simulation completed successfully!")

if __name__ == "__main__":
    run_simulation()
