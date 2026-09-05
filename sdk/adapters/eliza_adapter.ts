/**
 * ElizaOS Plugin for Decentralized AI Compute via Kridge
 */
export interface ElizaPluginDefinition {
  name: string;
  description: string;
  evaluators: any[];
  providers: any[];
  actions: any[];
}

export const createKridgeElizaPlugin = (config: { apiKey: string; baseUrl?: string }): ElizaPluginDefinition => {
  const baseUrl = config.baseUrl || "https://api.kridge.io/v1";
  return {
    name: "plugin-kridge",
    description: "Enables ElizaOS agents to acquire discounted compute and donate spare credits to public faucets",
    evaluators: [],
    providers: [],
    actions: [
      {
        name: "RENT_COMPUTE",
        description: "Rent AI model compute on Kridge marketplace",
        handler: async () => ({ success: true, proxyUrl: baseUrl })
      }
    ]
  };
};
