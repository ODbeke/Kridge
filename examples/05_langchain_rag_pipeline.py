"""Example: LangChain RAG pipeline powered by Kridge sub-keys."""
from sdk.adapters.langchain_adapter import ChatKridge

def main():
    llm = ChatKridge(api_key="krdg_live_demo", model="gpt-4o")
    res = llm.invoke([{"type": "user", "content": "Summarize GenLayer Intelligent Contracts."}])
    print("RAG Summary:", res)

if __name__ == "__main__":
    main()
