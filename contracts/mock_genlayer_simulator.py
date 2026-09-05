"""
Kridge GenLayer Intelligent Contract Local Test Simulator
=========================================================
Runs simulated multi-validator consensus, web probing, and dispute LLM arbitration.
"""

import json
from kridge_marketplace import KridgeMarketplaceContract, TIER_THRESHOLDS

def run_simulation():
    print("==================================================")
    print("🚀 Initializing Kridge GenLayer Intelligent Contract...")
    print("==================================================")
    contract = KridgeMarketplaceContract()
    
    # 1. Create a For Rent Listing
    print("\n[Step 1] Seller lists 500k tokens of Claude 3.5 Sonnet for $4.00 (70% OFF)...")
    listing_id_1 = contract.create_listing(
        seller="0xSeller_Alice_Base",
        provider="anthropic",
        model_family="claude-3-5-sonnet",
        listing_type="RENT",
        quota_tokens=500000,
        price_usd=4.00,
        expiry_timestamp=1757200000,
        encrypted_key_ref="enc_vault_ref_981a2b"
    )
    print(f"✅ Listing #{listing_id_1} created.")
    
    # 2. Validator Health Probing
    print(f"\n[Step 2] GenLayer Validators execute gl.get_web_data on Listing #{listing_id_1}...")
    health = contract.verify_listing_health(listing_id_1)
    print(f"✅ Health verification result: {health}")
    
    # 3. Create a DONATION Listing
    print("\n[Step 3] Philanthropist creates a $500 AI Compute Donation (100M tokens GPT-4o)...")
    listing_id_2 = contract.create_listing(
        seller="0xDonor_Bob_zkSync",
        provider="openai",
        model_family="gpt4o",
        listing_type="DONATION",
        quota_tokens=100000000,
        price_usd=0.0,
        expiry_timestamp=1757300000,
        encrypted_key_ref="enc_vault_ref_bob_gpt4o"
    )
    print(f"✅ Donation Listing #{listing_id_2} created. Retail ESG value credited.")
    
    # 4. Check Donor Profile
    donor_profile = contract.get_donor_profile("0xDonor_Bob_zkSync")
    print(f"\n[Step 4] Bob Donor Profile on GenLayer: {json.dumps(donor_profile, indent=2)}")
    
    # 5. Buyer Rents Listing
    print("\n[Step 5] Buyer (Agent) rents Listing #1 with $4.00 USDC in Escrow...")
    rental_id = contract.rent_listing(
        listing_id=listing_id_1,
        buyer="0xAgent_Charlie_Solana",
        duration_hours=24,
        sub_key_hash="krdg_live_hash_7781bc"
    )
    print(f"✅ Rental Session #{rental_id} initiated.")
    
    # 6. Dispute Filing
    print("\n[Step 6] Simulating Upstream Revocation (HTTP 401) & Dispute Filing with $1.00 Bond...")
    dispute_id = contract.file_dispute(
        rental_id=rental_id,
        complainant="0xAgent_Charlie_Solana",
        reason="API Key was revoked upstream (401 Unauthorized)",
        error_trace="HTTP 401: Invalid API Key provided to Anthropic API",
        gateway_receipt="SIG_KRIDGE_GATEWAY_0x99281a"
    )
    print(f"✅ Dispute #{dispute_id} filed with $1.00 anti-spam bond.")
    
    # 7. GenLayer AI Validator Arbitration
    print("\n[Step 7] GenLayer AI Validators running gl.exec_prompt consensus...")
    verdict = contract.resolve_dispute(dispute_id)
    print(f"⚖️ GenLayer Arbitration Verdict: {json.dumps(verdict, indent=2)}")
    
    print("\n[Step 8] Final Market Statistics:")
    print(json.dumps(contract.get_market_stats(), indent=2))
    print("\n🎉 Simulation completed successfully!")

if __name__ == "__main__":
    run_simulation()