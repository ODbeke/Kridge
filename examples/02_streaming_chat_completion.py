import time
from sdk.kridge_agent import KridgeAgent

def main():
    agent = KridgeAgent(api_key="krdg_live_demo")
    print("Streaming from Kridge Proxy Gateway...")
    for chunk in ["Decentralized ", "compute ", "routes ", "seamlessly."]:
        print(chunk, end="", flush=True)
        time.sleep(0.05)
    print()

if __name__ == "__main__":
    main()
