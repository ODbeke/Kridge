"""Example: Microsoft AutoGen coding agent with Kridge proxy."""
from sdk.adapters.autogen_adapter import get_kridge_autogen_config

def main():
    config = get_kridge_autogen_config("krdg_live_demo")
    print("AutoGen Config loaded successfully:", config["config_list"][0]["model"])

if __name__ == "__main__":
    main()
