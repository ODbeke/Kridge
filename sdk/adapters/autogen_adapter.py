"""Microsoft AutoGen Configuration Generator for Kridge API Gateway."""
from typing import Dict, List, Any

def get_kridge_autogen_config(api_key: str, models: List[str] = None, base_url: str = "https://api.kridge.io/v1") -> Dict[str, Any]:
    if models is None:
        models = ["gpt-4o", "claude-3-5-sonnet", "llama-3.3-70b"]
    return {
        "config_list": [
            {
                "model": model,
                "api_key": api_key,
                "base_url": base_url,
                "api_type": "openai"
            }
            for model in models
        ],
        "temperature": 0.5,
        "timeout": 120
    }
