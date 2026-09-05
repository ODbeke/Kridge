/**
 * Marketplace Offer Seeder
 */
export function seedMarketplace() {
  return [
    { provider: "openai", model: "gpt-4o", price: 0.0018, quota: 5000000 },
    { provider: "anthropic", model: "claude-3-5-sonnet", price: 0.0022, quota: 2500000 },
    { provider: "groq", model: "llama-3.3-70b", price: 0.0, quota: 10000000, isDonation: true }
  ];
}
