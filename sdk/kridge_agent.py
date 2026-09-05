"""
Kridge Autonomous Agent SDK (Python)
====================================
Seamless drop-in for LangChain, CrewAI, AutoGPT, and autonomous agent swarms.
"""

import requests
from typing import List, Dict, Optional, Any

class KridgeAgent:
    def __init__(self, gateway_url: str = "http://localhost:3000", agent_wallet: str = "0xAgentAuto_123"):
        self.gateway_url = gateway_url
        self.agent_wallet = agent_wallet

    def discover_credits(self, provider: Optional[str] = None, listing_type: str = "ALL") -> List[Dict[str, Any]]:
        params = {}
        if provider:
            params["provider"] = provider
        if listing_type != "ALL":
            params["type"] = listing_type
            
        r = requests.get(f"{self.gateway_url}/api/agent/listings", params=params)
        r.raise_for_status()
        return r.json().get("listings", [])

    def acquire_sub_key(self, listing_id: int, duration_hours: int = 24) -> Dict[str, Any]:
        payload = {
            "listingId": listing_id,
            "agentWallet": self.agent_wallet,
            "durationHours": duration_hours
        }
        r = requests.post(f"{self.gateway_url}/api/agent/rent", json=payload)
        r.raise_for_status()
        return r.json()

    def get_openai_client_kwargs(self, session_data: Dict[str, Any]) -> Dict[str, str]:
        return {
            "api_key": session_data["subKey"],
            "base_url": f"{session_data[gatewayUrl]}/api/proxy/v1"
        }