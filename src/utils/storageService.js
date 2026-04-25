// src/utils/storageService.js

import CryptoJS from "crypto-js";
import {
  isLocalOnly,
  isMigrationEligible,
  isAuthOnly,
} from "./dataPolicy";

/* ---------- Constants ---------- */

const ENCRYPTED_PREFIX = "enc_";
const CRYPTO_KEY_NAME = "rithuma_crypto_key";

/* ---------- UID Scoped Key Helper ---------- */
/*
   Anonymous users → global keys
   Authenticated users → UID scoped keys
*/
function getScopedKey(key, userId) {
  if (!userId || userId === "guest") {
    return `guest_${key}`; // always prefix guest
  }
  return `${userId}_${key}`;
}

/* ---------- Crypto helpers ---------- */

function getCryptoKey() {
  return localStorage.getItem(CRYPTO_KEY_NAME);
}

function decrypt(encrypted, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

function encrypt(value, key) {
  return CryptoJS.AES.encrypt(JSON.stringify(value), key).toString();
}

/* ---------- READ ---------- */

export function readData(key, options = {}) {
  const { userId } = options;
  const scopedKey = getScopedKey(key, userId);
  const cryptoKey = getCryptoKey();

  // Prefer encrypted
  const encrypted = localStorage.getItem(ENCRYPTED_PREFIX + scopedKey);
  if (encrypted && cryptoKey) {
    return decrypt(encrypted, cryptoKey);
  }

  // Fallback to plain
  const raw = localStorage.getItem(scopedKey);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/* ---------- WRITE (POLICY ENFORCED) ---------- */

export function writeData(key, value, options = {}) {
  const { userType = "anonymous", userId } = options;
  const scopedKey = getScopedKey(key, userId);
  const cryptoKey = getCryptoKey();

  // 🚫 Block auth-only data for anonymous users
  if (isAuthOnly(key) && userType !== "authenticated") {
    console.warn(`🚫 Blocked auth-only write: ${key}`);
    return;
  }

 // ⚠️ Block ONLY legacy writes after authentication
if (
  userType === "authenticated" &&
  isMigrationEligible(key) &&
  !userId
) {
  console.warn(`⚠️ Missing userId, but allowing write (fallback mode): ${key}`);
  // DO NOT BLOCK — allow write
}


  // ✅ Write encrypted if crypto key exists
  if (cryptoKey) {
    const encrypted = encrypt(value, cryptoKey);
    localStorage.setItem(ENCRYPTED_PREFIX + scopedKey, encrypted);
  } else {
    localStorage.setItem(scopedKey, JSON.stringify(value));
  }
}

/* ---------- REMOVE ---------- */

export function removeData(key, options = {}) {
  const { userId } = options;
  const scopedKey = getScopedKey(key, userId);

  localStorage.removeItem(scopedKey);
  localStorage.removeItem(ENCRYPTED_PREFIX + scopedKey);
}
