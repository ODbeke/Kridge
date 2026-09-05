"""Unit tests for public compute faucet donations and credit distribution."""
import unittest
from contracts.kridge_marketplace import KridgeMarketplace

class TestDonationFaucet(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_donate_credits_to_public_faucet(self):
        lid = self.market.create_listing(
            seller="0xPhilanthropist",
            provider="groq",
            model="llama-3.3-70b",
            tokens_available=10_000_000,
            price_per_1k_tokens=0.0,
            is_donation=True,
            encrypted_key="enc_groq_donation"
        )
        listing = self.market.listings[lid]
        self.assertTrue(listing["is_donation"])
        self.assertEqual(listing["price_per_1k_tokens"], 0.0)

    def test_claim_faucet_quota_for_open_source_agent(self):
        lid = self.market.create_listing("0xPhilanthropist", "groq", "llama-3.3-70b", 5_000_000, 0.0, True, "enc_groq")
        claim = self.market.claim_faucet_grant(lid, recipient="0xOpenSourceAgent", requested_tokens=100_000)
        self.assertEqual(claim["status"], "GRANTED")
        self.assertEqual(claim["cost"], 0.0)

if __name__ == "__main__":
    unittest.main()
