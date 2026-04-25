import { readData, writeData } from "./storageService";
import { pushToCloud } from "./cloudSyncService";

export async function migrateGuestData(user, userType) {
  if (!user || userType !== "authenticated") return;

  try {
    console.log("🚀 Checking guest data...");

    const scopeUser = {
      userId: user.uid,
      userType: "authenticated",
    };

    const guestScope = {
      userId: "guest",
      userType: "guest",
    };

    /* ---------- READ ---------- */

    const guestSymptoms = readData("rithuma_symptoms", guestScope);
    const guestCycleLength = readData("rithuma_cycle_length", guestScope);
    const guestLastPeriod = readData("rithuma_last_period", guestScope);

    const hasGuestData =
      guestSymptoms || guestCycleLength || guestLastPeriod;

    if (!hasGuestData) {
      console.log("✅ No guest data");
      return;
    }

    console.log("⚡ Migrating guest data...");

    /* ---------- CHECK EXISTING USER DATA ---------- */

    const existingSymptoms = readData("rithuma_symptoms", scopeUser);
    const existingCycle = readData("rithuma_cycle_length", scopeUser);
    const existingPeriod = readData("rithuma_last_period", scopeUser);

    /* ---------- SAFE MIGRATION (NO OVERRIDE) ---------- */

    if (!existingSymptoms && guestSymptoms) {
      writeData("rithuma_symptoms", guestSymptoms, scopeUser);
    }

    if (!existingCycle && guestCycleLength) {
      writeData("rithuma_cycle_length", guestCycleLength, scopeUser);
    }

    if (!existingPeriod && guestLastPeriod) {
      writeData("rithuma_last_period", guestLastPeriod, scopeUser);
    }

    /* ---------- PUSH CLEAN DATA ---------- */

    await pushToCloud(user.uid, {
      symptoms: existingSymptoms || guestSymptoms || {},
      cycle: {
        length: existingCycle || guestCycleLength,
        lastPeriod: existingPeriod || guestLastPeriod,
      },
    });

    console.log("☁️ Synced safely");

    /* ---------- CLEAN GUEST DATA ---------- */

    localStorage.removeItem("guest_rithuma_symptoms");
    localStorage.removeItem("guest_rithuma_cycle_length");
    localStorage.removeItem("guest_rithuma_last_period");

    console.log("🧹 Guest data cleaned");
  } catch (err) {
    console.error("Migration error:", err);
  }
}