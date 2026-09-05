"""Unit tests for $1 Anti-Spam Dispute Bond slashing and refund mechanics."""
import unittest
from contracts.kridge_marketplace import KridgeMarketplace

class TestBondSlashing(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_valid_dispute_full_bond_refund(self):
        """On legitimate dispute, buyer receives 100% of the $1 bond back + rental refund."""
        result = self.market.process_dispute_bond(
            dispute_id="disp_valid_1",
            bond_amount=1.00,
            is_fraudulent_claim=False
        )
        self.assertEqual(result["buyer_bond_refund"], 1.00)
        self.assertEqual(result["slashed_to_treasury"], 0.00)

    def test_fraudulent_dispute_50_50_slashing(self):
        """On false/spam dispute, 50% ($0.50) is slashed to Treasury and 50% ($0.50) refunded."""
        result = self.market.process_dispute_bond(
            dispute_id="disp_spam_2",
            bond_amount=1.00,
            is_fraudulent_claim=True
        )
        self.assertEqual(result["buyer_bond_refund"], 0.50) # 50% refunded
        self.assertEqual(result["slashed_to_treasury"], 0.50) # 50% slashed to treasury
        self.assertEqual(self.market.treasury_balance, 0.50)

if __name__ == "__main__":
    unittest.main()
