"""Microsoft Semantic Kernel Chat Completion Connector."""
from typing import Any, List, Dict

class KridgeChatCompletion:
    """Semantic Kernel Chat Completion Connector for Kridge."""
    def __init__(self, api_key: str, model_id: str = "gpt-4o", endpoint: str = "https://api.kridge.io/v1"):
        self.api_key = api_key
        self.model_id = model_id
        self.endpoint = endpoint

    async def get_chat_message_content(self, chat_history: List[Dict[str, str]]) -> str:
        return "Semantic Kernel response from Kridge"
