/**
 * Public Compute Faucet Dispenser
 */
export class FaucetDispenser {
  private claims: Map<string, number> = new Map();

  public claimQuota(walletAddress: string, grantSize = 50000): { success: boolean; tokens: number } {
    if (this.claims.has(walletAddress)) {
      return { success: false, tokens: 0 };
    }
    this.claims.set(walletAddress, Date.now());
    return { success: true, tokens: grantSize };
  }
}
