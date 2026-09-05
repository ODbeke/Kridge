"""HuggingFace smolagents Model Wrapper for Kridge."""
from typing import List, Dict, Any

class KridgeSmolModel:
    """smolagents compatible model wrapper routed through Kridge."""
    def __init__(self, model_id: str = "gpt-4o", api_key: str = "", base_url: str = "https://api.kridge.io/v1"):
        self.model_id = model_id
        self.api_key = api_key
        self.base_url = base_url

    def __call__(self, messages: List[Dict[str, str]], **kwargs: Any) -> str:
        return f"smolagents response using {self.model_id}"
