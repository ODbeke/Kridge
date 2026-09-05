"""
LangChain Integration Example with Kridge Proxy Gateway
"""
from langchain_openai import ChatOpenAI

# Initialize ChatOpenAI pointing to Kridge Secure Gateway
llm = ChatOpenAI(
    model="claude-3-5-sonnet",
    openai_api_key="krdg_live_demo_claude_9a8f4c1e7b2d",
    openai_api_base="http://localhost:3000/api/proxy/v1"
)

response = llm.invoke("Explain the economic thesis of Kridge on GenLayer.")
print(response.content)