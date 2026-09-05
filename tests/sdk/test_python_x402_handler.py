"""Unit tests for autonomous agent x402 payment header handler."""
import unittest

class X402PaymentHandler:
    @staticmethod
    def parse_402_challenge(response_headers):
        challenge = response_headers.get("WWW-Authenticate")
        if challenge and "KridgeScheme" in challenge:
            return {
                "price": float(response_headers.get("X-Kridge-Required-Payment", "0.0")),
                "currency": "USDC",
                "recipient": response_headers.get("X-Kridge-Escrow-Address")
            }
        return None

class TestX402Handler(unittest.TestCase):
    def test_parse_valid_402_challenge(self):
        headers = {
            "WWW-Authenticate": "KridgeScheme realm="AI Compute"",
            "X-Kridge-Required-Payment": "0.05",
            "X-Kridge-Escrow-Address": "0xEscrowAddress777"
        }
        res = X402PaymentHandler.parse_402_challenge(headers)
        self.assertIsNotNone(res)
        self.assertEqual(res["price"], 0.05)
        self.assertEqual(res["recipient"], "0xEscrowAddress777")

if __name__ == "__main__":
    unittest.main()
