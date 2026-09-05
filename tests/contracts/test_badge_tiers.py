"""Unit tests for Kridge ESG Impact Badge progression and threshold validation."""
import unittest
from contracts.kridge_marketplace import KridgeMarketplace

class TestBadgeTiers(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_badge_threshold_evaluations(self):
        # 6 Tiers: Wood ($50), Bronze ($250), Silver ($1k), Gold ($5k), Diamond ($10k), Platinum ($20k)
        self.assertEqual(self.market.evaluate_badge_tier(25.0), None)
        self.assertEqual(self.market.evaluate_badge_tier(50.0), "Wood")
        self.assertEqual(self.market.evaluate_badge_tier(249.99), "Wood")
        self.assertEqual(self.market.evaluate_badge_tier(250.0), "Bronze")
        self.assertEqual(self.market.evaluate_badge_tier(1000.0), "Silver")
        self.assertEqual(self.market.evaluate_badge_tier(5000.0), "Gold")
        self.assertEqual(self.market.evaluate_badge_tier(10000.0), "Diamond")
        self.assertEqual(self.market.evaluate_badge_tier(20000.0), "Platinum")
        self.assertEqual(self.market.evaluate_badge_tier(55000.0), "Platinum")

    def test_cumulative_donation_badge_minting(self):
        donor = "0xGreenAI"
        self.market.record_donation(donor, 30.0)
        self.assertIsNone(self.market.get_donor_badge(donor))
        
        self.market.record_donation(donor, 25.0) # Total $55
        self.assertEqual(self.market.get_donor_badge(donor), "Wood")
        
        self.market.record_donation(donor, 200.0) # Total $255
        self.assertEqual(self.market.get_donor_badge(donor), "Bronze")

if __name__ == "__main__":
    unittest.main()
