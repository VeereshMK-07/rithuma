/* ------------------ Migration Status Utils ------------------ */

export const MIGRATION_STATUS_KEY = "rithuma_user_migration_status";

/**
 * Returns current migration status
 * possible values: "pending" | "done"
 */
export function getMigrationStatus() {
  return localStorage.getItem(MIGRATION_STATUS_KEY) || "pending";
}

/**
 * Mark migration as completed
 */
export function markMigrationDone() {
  localStorage.setItem(MIGRATION_STATUS_KEY, "done");
}

/**
 * Should we show migration prompt?
 */
export function shouldShowMigrationPrompt(userType) {
  if (userType !== "authenticated") return false;

  const status = getMigrationStatus();
  return status === "pending";
}
