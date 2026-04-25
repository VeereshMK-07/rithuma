// src/utils/secureStorage.js

import { encryptData, decryptData } from "./cryptoUtils";

/* ------------------ Secure storage API ------------------ */

export async function secureSet(key, value) {
  const encrypted = await encryptData(value);
  localStorage.setItem(key, JSON.stringify(encrypted));
}

export async function secureGet(key) {
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    return await decryptData(JSON.parse(stored));
  } catch {
    return null; // fallback if corrupted
  }
}

export function secureRemove(key) {
  localStorage.removeItem(key);
}
