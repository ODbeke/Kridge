"""Unit tests for SDK client-side provider fallback routing."""
import unittest

class FallbackRouter:
    def __init__(self, primary_provider="openai", fallback_provider="groq"):
        self.primary = primary_provider
        self.fallback = fallback_provider

    def route_request(self, is_primary_available: bool) -> str:
        return self.primary if is_primary_available else self.fallback

class TestFallbackRouter(unittest.TestCase):
    def test_fallback_selection(self):
        router = FallbackRouter("openai", "groq")
        self.assertEqual(router.route_request(True), "openai")
        self.assertEqual(router.route_request(False), "groq")

if __name__ == "__main__":
    unittest.main()
