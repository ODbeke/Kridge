"""LangChain ChatKridge Adapter for seamless decentralized compute integration."""
from typing import Any, List, Optional
import urllib.request
import json

class ChatKridge:
    """LangChain-compatible chat model routed through Kridge Proxy Gateway."""
    def __init__(self, api_key: str, model: str = "gpt-4o", base_url: str = "https://api.kridge.io/v1", temperature: float = 0.7):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.temperature = temperature

    def invoke(self, messages: List[Any]) -> str:
        formatted = [{"role": getattr(m, "type", "user"), "content": getattr(m, "content", str(m))} for m in messages]
        payload = json.dumps({"model": self.model, "messages": formatted, "temperature": self.temperature}).encode("utf-8")
        req = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=payload,
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {self.api_key}"}
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
