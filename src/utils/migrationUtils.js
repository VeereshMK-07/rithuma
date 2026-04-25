import CryptoJS from "crypto-js";

/* ---------- Constants ---------- */

// Step 6.x — Encryption migration
const MIGRATION_VERSION_KEY = "rithuma_migration_v1";
const ENCRYPTED_PREFIX = "enc_";

// Step 7.x — User migration
const USER_MIGRATION_KEY = "rithuma_user_migration_status";

/* ---------- Encryption helpers ---------- */

function getCryptoKey() {
  let key = localStorage.getItem("rithuma_crypto_key");
  if (!key) {
    key = CryptoJS.lib.WordArray.random(16).toString();
    localStorage.setItem("rithuma_crypto_key", key);
  }
  return key;
}

function encrypt(value, key) {
  return CryptoJS.AES.encrypt(JSON.stringify(value), key).toString();
}

/* ---------- Step 6.x — Encryption migration ---------- */

function runEncryptionMigrationIfNeeded() {
  const alreadyMigrated = localStorage.getItem(MIGRATION_VERSION_KEY);
  if (alreadyMigrated === "done") return;

  const cryptoKey = getCryptoKey();

  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith("rithuma_") &&
      !key.startsWith(ENCRYPTED_PREFIX) &&
      key !== "rithuma_crypto_key"
    ) {
      try {
        const raw = localStorage.getItem(key);
        const parsed = JSON.parse(raw);
        const encrypted = encrypt(parsed, cryptoKey);
        localStorage.setItem(ENCRYPTED_PREFIX + key, encrypted);
      } catch {
        // ignore non-JSON values
      }
    }
  });

  localStorage.setItem(MIGRATION_VERSION_KEY, "done");
  console.log("✅ RITHUMA encryption migration completed");
}

/* ---------- Step 7.2 — User migration detection ---------- */

function runUserMigrationDetection(userType) {
  if (userType !== "authenticated") return;

  const existing = localStorage.getItem(USER_MIGRATION_KEY);
  if (existing) return;

  const hasLocalData =
    localStorage.getItem("rithuma_last_period") ||
    localStorage.getItem("rithuma_cycle_length") ||
    localStorage.getItem("rithuma_symptoms");

  if (hasLocalData) {
    localStorage.setItem(USER_MIGRATION_KEY, "pending");
    console.info("🔁 User migration detected → pending");
  }
}

/* ---------- Public API ---------- */

export function runMigrationIfNeeded(userType) {
  runEncryptionMigrationIfNeeded();
  runUserMigrationDetection(userType);
}

export function getUserMigrationStatus() {
  return localStorage.getItem(USER_MIGRATION_KEY);
}

export function completeUserMigration() {
  localStorage.setItem(USER_MIGRATION_KEY, "completed");
  console.info("✅ User migration confirmed by user");
}
