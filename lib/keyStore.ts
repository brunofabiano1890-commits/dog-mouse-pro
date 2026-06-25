// In-memory key store (persists while server is running)
// In production, replace with a real database

export type KeyPlan = "Diária" | "Mensal" | "Anual" | "MASTER";

export interface StoredKey {
  key: string;
  plan: KeyPlan;
  expiry: string; // ISO date
  user: string;
  createdAt: string;
  used: boolean;
}

// Seed with the master key
const keyMap = new Map<string, StoredKey>([
  [
    "DOG-MASTER-INFINITY-0000",
    {
      key: "DOG-MASTER-INFINITY-0000",
      plan: "MASTER",
      expiry: "2099-12-31",
      user: "Dono do App",
      createdAt: new Date().toISOString(),
      used: false,
    },
  ],
]);

export function getAllKeys(): StoredKey[] {
  return Array.from(keyMap.values());
}

export function getKey(key: string): StoredKey | undefined {
  return keyMap.get(key.trim().toUpperCase());
}

export function addKey(k: StoredKey): void {
  keyMap.set(k.key, k);
}

export function deleteKey(key: string): void {
  keyMap.delete(key.trim().toUpperCase());
}

// Generate a unique key string: DOG-XXXX-XXXX-XXXX
export function generateKeyString(): string {
  const seg = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DOG-${seg()}-${seg()}-${seg()}`;
}

// Compute expiry date based on plan
export function expiryForPlan(plan: KeyPlan): string {
  const d = new Date();
  if (plan === "Diária") d.setDate(d.getDate() + 1);
  else if (plan === "Mensal") d.setMonth(d.getMonth() + 1);
  else if (plan === "Anual") d.setFullYear(d.getFullYear() + 1);
  else d.setFullYear(2099); // MASTER
  return d.toISOString().split("T")[0];
}
