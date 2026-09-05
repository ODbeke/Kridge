"""deepset Haystack KridgeGenerator Pipeline Component."""
from typing import Dict, Any, List

class KridgeGenerator:
    """Haystack pipeline generator component powered by Kridge sub-keys."""
    def __init__(self, api_key: str, model: str = "gpt-4o", base_url: str = "https://api.kridge.io/v1"):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url

    def run(self, prompt: str) -> Dict[str, Any]:
        return {"replies": [f"Haystack reply using {self.model}"], "meta": [{"model": self.model}]}
