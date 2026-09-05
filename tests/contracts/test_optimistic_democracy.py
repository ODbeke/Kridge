"""Unit tests for Optimistic Democracy appeal escalation and juror consensus."""
import unittest
from contracts.kridge_marketplace import KridgeMarketplace

class TestOptimisticDemocracy(unittest.TestCase):
    def setUp(self):
        self.market = KridgeMarketplace()

    def test_appeal_window_and_stake_requirement(self):
        dispute_id = "disp_202"
        appeal = self.market.file_appeal(dispute_id, appellant="0xSeller", appeal_stake=25.0)
        self.assertEqual(appeal["status"], "APPEAL_PENDING_VOTE")
        self.assertEqual(appeal["stake_locked"], 25.0)

    def test_juror_consensus_threshold(self):
        dispute_id = "disp_202"
        self.market.file_appeal(dispute_id, "0xSeller", 25.0)
        
        # 5 Jurors vote: 4 Uphold, 1 Overturn
        votes = [
            ("0xJuror1", "UPHOLD"),
            ("0xJuror2", "UPHOLD"),
            ("0xJuror3", "UPHOLD"),
            ("0xJuror4", "OVERTURN"),
            ("0xJuror5", "UPHOLD")
        ]
        for juror, vote in votes:
            self.market.cast_juror_vote(dispute_id, juror, vote)
            
        final_verdict = self.market.finalize_appeal(dispute_id)
        self.assertEqual(final_verdict["outcome"], "UPHELD")
        self.assertEqual(final_verdict["consensus_ratio"], 0.80)

if __name__ == "__main__":
    unittest.main()
