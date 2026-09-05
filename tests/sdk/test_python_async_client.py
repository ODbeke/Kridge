"""Unit tests for Python AsyncKridgeAgent."""
import unittest
import asyncio

class AsyncKridgeAgent:
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def chat_completion(self, messages, model="gpt-4o"):
        await asyncio.sleep(0.01)
        return {"choices": [{"message": {"role": "assistant", "content": "Async response"}}]}

class TestPythonAsyncClient(unittest.TestCase):
    def test_async_chat_completion(self):
        async def run_test():
            client = AsyncKridgeAgent(api_key="krdg_live_async")
            res = await client.chat_completion([{"role": "user", "content": "Hello"}])
            self.assertEqual(res["choices"][0]["message"]["content"], "Async response")
        asyncio.run(run_test())

if __name__ == "__main__":
    unittest.main()
