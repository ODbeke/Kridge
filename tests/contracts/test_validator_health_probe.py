"""Unit tests simulating validator HTTP probing on AI provider endpoints."""
import unittest
from contracts.kridge_marketplace import KridgeMarketplace

class TestValidatorHealthProbe(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_healthy_provider_probe_consensus(self):
        mock_web_response = {"status": 200, "latency_ms": 142, "model": "gpt-4o"}
        result = self.market.validate_provider_health("openai", "mock_key_valid", mock_response=mock_web_response)
        self.assertTrue(result["is_healthy"])
        self.assertLess(result["latency_ms"], 500)

    def test_exhausted_quota_probe_detection(self):
        mock_web_response = {"status": 429, "error": {"code": "insufficient_quota"}}
        result = self.market.validate_provider_health("openai", "mock_key_exhausted", mock_response=mock_web_response)
        self.assertFalse(result["is_healthy"])
        self.assertEqual(result["error_reason"], "INSUFFICIENT_QUOTA")

if __name__ == "__main__":
    unittest.main()
