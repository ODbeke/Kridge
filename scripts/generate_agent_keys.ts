/**
 * Batch Agent Key Generator
 */
export function generateAgentKeys(count = 10) {
  return Array.from({ length: count }, (_, i) => ({ id: "agent_" + i, key: "krdg_live_agent_" + i }));
}
