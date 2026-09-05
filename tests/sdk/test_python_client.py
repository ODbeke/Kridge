"""Unit tests for Python Kridge SDK client."""
import unittest
from sdk.kridge_agent import KridgeAgent

class TestPythonClient(unittest.TestCase):
    def test_client_init(self):
        client = KridgeAgent(api_key="krdg_live_test123", base_url="https://api.kridge.io/v1")
        self.assertEqual(client.api_key, "krdg_live_test123")
        self.assertEqual(client.base_url, "https://api.kridge.io/v1")

    def test_client_default_headers(self):
        client = KridgeAgent(api_key="krdg_live_test123")
        headers = client._get_headers()
        self.assertEqual(headers["Authorization"], "Bearer krdg_live_test123")
        self.assertEqual(headers["User-Agent"], "Kridge-Python-SDK/1.0.0")

if __name__ == "__main__":
    unittest.main()
