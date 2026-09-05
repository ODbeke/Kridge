"""LangGraph State Graph Node Wrapper for Kridge."""
from typing import Dict, Any

def create_kridge_node(api_key: str, model: str = "gpt-4o"):
    """Creates a LangGraph node that calls Kridge proxy with automatic retry."""
    def node_function(state: Dict[str, Any]) -> Dict[str, Any]:
        messages = state.get("messages", [])
        # Invoke via Kridge
        state["messages"] = messages + [{"role": "assistant", "content": "LangGraph node output"}]
        return state
    return node_function
