"""Example: CrewAI multi-agent research crew using Kridge compute."""
from sdk.adapters.crewai_adapter import KridgeLLM

def main():
    llm = KridgeLLM(model="claude-3-5-sonnet", api_key="krdg_live_demo")
    result = llm.call("Research decentralized key aggregation mechanics.")
    print("Crew Result:", result)

if __name__ == "__main__":
    main()
