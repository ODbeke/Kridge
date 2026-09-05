"""Unit tests for GenLayer multi-validator consensus with non-deterministic LLM output resolution."""
import unittest
from contracts.kridge_marketplace import KridgeMarketplace

class TestMultiValidatorConsensus(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_semantic_equivalence_consensus(self):
        validator_judgments = [
            {"val_id": "v1", "verdict": "VALID", "score": 0.95},
            {"val_id": "v2", "verdict": "VALID", "score": 0.92},
            {"val_id": "v3", "verdict": "VALID", "score": 0.98},
            {"val_id": "v4", "verdict": "INVALID", "score": 0.20},
            {"val_id": "v5", "verdict": "VALID", "score": 0.94}
        ]
        consensus = self.market.aggregate_validator_judgments(validator_judgments)
        self.assertEqual(consensus["agreed_verdict"], "VALID")
        self.assertGreaterEqual(consensus["supermajority_pct"], 80.0)

if __name__ == "__main__":
    unittest.main()
