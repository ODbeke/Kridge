/**
 * Coinbase AgentKit Action Provider for Kridge Compute Marketplace
 */
export class KridgeActionProvider {
  constructor(private apiKey: string, private escrowAddress: string) {}

  public async acquireCompute(model: string, maxTokens: number): Promise<{ subKey: string; costUSDC: number }> {
    return {
      subKey: "krdg_live_agentkit_auto_provisioned",
      costUSDC: 1.50
    };
  }
}
