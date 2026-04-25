/**
 * Defines strict boundaries for RITHUMA data
 * Privacy + Auth safety layer
 */

export const LOCAL_ONLY_KEYS = [
  "rithuma_last_period",
  "rithuma_cycle_length",
  "rithuma_symptoms",
  "rithuma_nudge_feedback",
];

export const AUTH_ONLY_KEYS = [
  "user_profile",
  "user_preferences",
];

export const MIGRATION_ELIGIBLE_KEYS = [
  "rithuma_last_period",
  "rithuma_cycle_length",
  "rithuma_symptoms",
];

/* ---------- Internal Helper ---------- */

function getBaseKey(key) {
  if (!key.startsWith("rithuma_")) return key;

  const parts = key.split("_");

  // If 3+ parts → assume last part is UID
  if (parts.length >= 3) {
    return parts.slice(0, 2).join("_");
  }

  return key;
}

/* ---------- Policies ---------- */

export function isLocalOnly(key) {
  return LOCAL_ONLY_KEYS.includes(getBaseKey(key));
}

export function isMigrationEligible(key) {
  return MIGRATION_ELIGIBLE_KEYS.includes(getBaseKey(key));
}

export function isAuthOnly(key) {
  return AUTH_ONLY_KEYS.includes(getBaseKey(key));
}
