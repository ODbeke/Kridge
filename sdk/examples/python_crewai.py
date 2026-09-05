"""
CrewAI Multi-Agent Swarm with Kridge Capacity Pool
"""
from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI

kridge_llm = ChatOpenAI(
    model="gpt-4o",
    openai_api_key="krdg_live_demo_claude_9a8f4c1e7b2d",
    openai_api_base="http://localhost:3000/api/proxy/v1"
)

researcher = Agent(
    role="Compute Market Analyst",
    goal="Identify enterprise shelfware savings",
    backstory="Specialized in AI compute economics",
    llm=kridge_llm
)

task = Task(
    description="Calculate savings when renting Claude 3.5 Sonnet at 70% discount.",
    expected_output="Detailed breakdown of compute cost arbitrage.",
    agent=researcher
)

crew = Crew(agents=[researcher], tasks=[task])
print("Crew ready with Kridge Proxy Gateway.")