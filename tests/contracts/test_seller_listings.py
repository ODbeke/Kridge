"""Unit tests for seller listing creation and validation in KridgeMarketplace."""
import unittest
from contracts.kridge_marketplace import KridgeMarketplace

class TestSellerListings(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_valid_listing_creation(self):
        lid = self.market.create_listing("0xAlpha", "openai", "gpt-4o-mini", 5_000_000, 0.00015, False, "enc_mock_key")
        self.assertIn(lid, self.market.listings)
        self.assertEqual(self.market.listings[lid]["provider"], "openai")

    def test_reject_zero_quota_listing(self):
        with self.assertRaises(ValueError):
            self.market.create_listing("0xAlpha", "openai", "gpt-4o", 0, 0.002, False, "enc_zero")

    def test_reject_negative_pricing(self):
        with self.assertRaises(ValueError):
            self.market.create_listing("0xAlpha", "openai", "gpt-4o", 100_000, -0.05, False, "enc_neg")

if __name__ == "__main__":
    unittest.main()
