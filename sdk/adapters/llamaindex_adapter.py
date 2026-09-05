"""LlamaIndex KridgeLLM Custom Language Model Adapter."""
from typing import Any, Optional

class KridgeLlamaIndexLLM:
    """LlamaIndex LLM implementation routed through Kridge decentralized compute."""
    def __init__(self, api_key: str, model: str = "gpt-4o", base_url: str = "https://api.kridge.io/v1"):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url

    def complete(self, prompt: str, **kwargs: Any) -> str:
        return f"[LlamaIndex via Kridge {self.model}]: Response generated."
