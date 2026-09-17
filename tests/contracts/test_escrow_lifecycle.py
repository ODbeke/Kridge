"""Unit tests for GenLayer Intelligent Contract escrow lifecycle with native payable funds custody."""
import unittest
from contracts.kridge_marketplace import KridgeMarketplace

class TestEscrowLifecycle(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_create_escrow_and_lock_funds(self):
        """Verify buyer funds are securely locked in escrow custody upon rental initiation."""
        listing_id = self.market.create_listing(
            seller="0xSeller111",
            provider="openai",
            model="gpt-4o",
            tokens_available=1_000_000,
            price_per_1k_tokens=0.002,
            is_donation=False,
            encrypted_key="enc_key_secret_123"
        )
        rental_id = self.market.initiate_rental(
            listing_id=listing_id,
            buyer="0xBuyer999",
            tokens_requested=500_000
        )
        rental = self.market.rentals.get(rental_id)
        self.assertIsNotNone(rental)
        self.assertEqual(rental["status"], "ACTIVE")
        self.assertEqual(rental["locked_amount"], 1.00) # $0.002 * 500 = $1.00
        self.assertGreater(rental.get("escrow_wei", 0), 0) # Native value custoded

    def test_complete_rental_settlement_and_native_payout(self):
        """Verify 5% fee deduction, native emit_transfer payout to seller upon successful rental."""
        listing_id = self.market.create_listing("0xSeller111", "anthropic", "claude-3-5-sonnet", 2_000_000, 0.003, False, "enc_claude")
        rental_id = self.market.initiate_rental(listing_id, "0xBuyer888", 1_000_000)
        
        # Settle rental with 1,000,000 tokens consumed ($3.00)
        receipt = self.market.settle_rental(rental_id, tokens_consumed=1_000_000)
        self.assertEqual(receipt["protocol_fee"], 0.15) # 5% of $3.00
        self.assertEqual(receipt["seller_payout"], 2.85) # 95% of $3.00
        self.assertEqual(receipt["status"], "SETTLED")

        # Native escrow custody settlement via emit_transfer
        self.assertGreater(receipt.get("escrow_payout_wei", 0), 0)
        self.assertGreater(receipt.get("protocol_fee_wei", 0), 0)
        # 95% to seller, 5% protocol fee
        total_escrow = receipt["escrow_payout_wei"] + receipt["protocol_fee_wei"]
        self.assertAlmostEqual(receipt["escrow_payout_wei"] / total_escrow, 0.95, places=2)

if __name__ == "__main__":
    unittest.main()
