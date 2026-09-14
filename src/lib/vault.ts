import fs from "fs";
import path from "path";

const VAULT_FILE = path.join(process.cwd(), "src/data/key-vault.json");

export interface VaultEntry {
  listingId: number;
  provider: string;
  apiKey: string;
  vaultedAt: number;
}

function readVault(): VaultEntry[] {
  try {
    if (fs.existsSync(VAULT_FILE)) {
      const data = fs.readFileSync(VAULT_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Could not read key vault:", e);
  }
  return [];
}

function writeVault(entries: VaultEntry[]) {
  try {
    const dir = path.dirname(VAULT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(VAULT_FILE, JSON.stringify(entries, null, 2), "utf-8");
  } catch (e) {
    console.warn("Could not write key vault:", e);
  }
}

export function vaultApiKey(listingId: number, provider: string, apiKey: string) {
  if (!apiKey) return;
  const entries = readVault().filter((e) => e.listingId !== listingId);
  entries.push({
    listingId,
    provider,
    apiKey: apiKey.trim(),
    vaultedAt: Date.now(),
  });
  writeVault(entries);
}

export function getVaultedApiKey(listingId: number): string | undefined {
  const entries = readVault();
  const entry = entries.find((e) => e.listingId === listingId);
  return entry?.apiKey;
}
