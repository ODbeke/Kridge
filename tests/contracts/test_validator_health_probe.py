"""Unit tests simulating validator HTTP probing on AI provider endpoints with live credential authentication."""
import unittest
import json
from contracts.kridge_marketplace import KridgeMarketplace

class TestValidatorHealthProbe(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_healthy_provider_probe_consensus(self):
        mock_web_response = {"status": 200, "latency_ms": 142, "model": "gpt-4o"}
        result = self.market.validate_provider_health("openai", "mock_key_valid_12345", mock_response=mock_web_response)
        self.assertTrue(result["is_healthy"])
        self.assertTrue(result.get("authenticated", False))
        self.assertLess(result["latency_ms"], 500)

    def test_exhausted_quota_probe_detection(self):
        mock_web_response = {"status": 429, "error": {"code": "insufficient_quota"}}
        result = self.market.validate_provider_health("openai", "mock_key_exhausted_12345", mock_response=mock_web_response)
        self.assertFalse(result["is_healthy"])
        self.assertEqual(result["error_reason"], "INSUFFICIENT_QUOTA")

    def test_unauthorized_credentials_rejected(self):
        """Verify that revoked or invalid seller keys fail authentication during health probe."""
        mock_web_response = {"status": 401, "error": {"code": "invalid_api_key"}}
        result = self.market.validate_provider_health("openai", "invalid_revoked_key", mock_response=mock_web_response)
        self.assertFalse(result["is_healthy"])
        self.assertEqual(result["error_reason"], "UNAUTHORIZED_KEY")
        self.assertFalse(result.get("authenticated", True))

    def test_empty_or_malformed_credentials_rejected(self):
        """Verify empty keys are immediately rejected."""
        result = self.market.validate_provider_health("openai", "")
        self.assertFalse(result["is_healthy"])
        self.assertEqual(result["error_reason"], "INVALID_CREDENTIALS")

    def test_verify_listing_health_with_live_credentials(self):
        """Verify that on-chain verify_listing_health authenticates credentials and records status."""
        lid = self.market.create_listing(
            seller="0xSellerCredentials",
            provider="anthropic",
            model="claude-3-5-sonnet",
            tokens_available=1_000_000,
            price_per_1k_tokens=0.003,
            is_donation=False,
            encrypted_key="sk-ant-live-credentials-verified-12345"
        )
        res_raw = self.market.verify_listing_health(lid)
        res = json.loads(res_raw)
        self.assertTrue(res.get("is_verified"))
        self.assertEqual(res.get("auth_status"), "CREDENTIALS_VERIFIED")

if __name__ == "__main__":
    unittest.main()
