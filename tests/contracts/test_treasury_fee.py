"""Unit tests for Kridge protocol 5% fee routing."""
import unittest
from contracts.kridge_marketplace import KridgeMarketplace

class TestTreasuryFee(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_treasury_accumulation(self):
        # 3 Rentals settled: $10, $50, $100
        self.market.accumulate_settlement_fee(gross_amount=10.00)
        self.market.accumulate_settlement_fee(gross_amount=50.00)
        self.market.accumulate_settlement_fee(gross_amount=100.00)
        
        # Total Gross: $160.00 -> 5% Protocol Take = $8.00
        self.assertAlmostEqual(self.market.treasury_balance, 8.00, places=4)

if __name__ == "__main__":
    unittest.main()
