"""Unit tests for GenLayer subjective LLM arbitration of complex API disputes."""
import unittest
from contracts.kridge_marketplace import KridgeMarketplace

class TestSubjectiveDispute(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_dispute_ruling_on_rate_limit_degradation(self):
        dispute_evidence = {
            "buyer_logs": [{"timestamp": 1741190000, "status": 429, "error": "rate_limit_exceeded"}],
            "gateway_hmac_proofs": 4,
            "promised_tier": "tier-5"
        }
        ruling = self.market.arbitrate_dispute_subjective(
            dispute_id="disp_101",
            evidence=dispute_evidence,
            simulated_llm_judgment="VALID_DISPUTE: Seller key downgraded to tier-1 causing persistent 429 errors."
        )
        self.assertTrue(ruling["buyer_refund_approved"])
        self.assertEqual(ruling["verdict"], "BUYER_FAVORED")

if __name__ == "__main__":
    unittest.main()
