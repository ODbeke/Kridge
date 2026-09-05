"""Unit tests for SDK exponential backoff retry strategy."""
import unittest
import random

class RetryStrategy:
    @staticmethod
    def calculate_backoff(attempt: int, base_delay: float = 0.5, max_delay: float = 8.0) -> float:
        delay = min(max_delay, base_delay * (2 ** attempt))
        jitter = random.uniform(0, delay)
        return jitter

class TestRetryStrategy(unittest.TestCase):
    def test_backoff_bounds(self):
        for attempt in range(5):
            delay = RetryStrategy.calculate_backoff(attempt, base_delay=0.1, max_delay=5.0)
            self.assertGreaterEqual(delay, 0.0)
            self.assertLessEqual(delay, 5.0)

if __name__ == "__main__":
    unittest.main()
