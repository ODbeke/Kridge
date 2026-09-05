export function isValidVirtualKey(key: string): boolean {
  return /^krdg_live_[a-zA-Z0-9_-]{16,64}$/.test(key);
}

export function isValidWalletAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export function isValidHttpUrl(str: string): boolean {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
