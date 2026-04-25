import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { readData, writeData } from "./storageService";

/* ---------- ⏱ TIMEOUT WRAPPER ---------- */
function withTimeout(promise, ms = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/* ---------- ☁️ PUSH (Local → Cloud) ---------- */
export async function pushToCloud(userId, localData, retries = 3) {
  if (!userId) return { success: false };

  try {
    const ref = doc(db, "users", userId);

    await withTimeout(
      setDoc(
        ref,
        {
          health: {
            symptoms: localData.symptoms || {},
            cycle: localData.cycle || {},
            lastPeriod: localData.lastPeriod || null,
          },
          lastUpdated: new Date().toISOString(),
        },
        { merge: true },
      ),
      5000, // ⏱ timeout
    );

    console.log("☁️ Data pushed to cloud");

    return { success: true };
  } catch (err) {
    console.error("Push error:", err);

    /* 🔁 RETRY LOGIC */
    if (retries > 0) {
      console.log(`🔁 Retrying... (${retries})`);
      return await pushToCloud(userId, localData, retries - 1);
    }

    /* ❌ FINAL FAILURE */
    console.error("❌ Push failed after retries");

    return { success: false, error: err };
  }
}

/* ---------- ⬇️ PULL (Cloud → Local + MERGE) ---------- */
export async function pullFromCloud(userId) {
  if (!userId) return null;

  try {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.log("No cloud data found");
      return null;
    }

    const cloudData = snap.data();

    /* 📦 GET LOCAL + CLOUD */
    const localSymptoms = readData("rithuma_symptoms", { userId }) || {};

    const cloudSymptoms = cloudData?.health?.symptoms || {};

    /* 🔄 MERGE */
    const mergedSymptoms = mergeSymptoms(localSymptoms, cloudSymptoms);

    /* 🩸 MERGE LAST PERIOD */

    const localPeriod = readData("rithuma_last_period", { userId , userType: "authenticated", });
    const cloudPeriod = cloudData?.health?.lastPeriod;

    // choose latest date
    let finalPeriod = localPeriod;

    if (cloudPeriod) {
      if (!localPeriod || new Date(cloudPeriod) > new Date(localPeriod)) {
        finalPeriod = cloudPeriod;
      }
    }

    // save merged result
    if (finalPeriod) {
      writeData("rithuma_last_period", finalPeriod, {
        userId,
        userType: "authenticated",
      });
    }

    /* 💾 SAVE MERGED LOCALLY */
    writeData("rithuma_symptoms", mergedSymptoms, {
      userId,
      userType: "authenticated",
    });

    console.log("🔄 Data merged successfully");

    /* ☁️ PUSH CLEAN DATA BACK */
    await pushToCloud(userId, {
      symptoms: mergedSymptoms,
      lastPeriod: finalPeriod,
    });

    return mergedSymptoms;
  } catch (err) {
    console.error("Pull error:", err);
    return null;
  }
}

/* ---------- 🔀 MERGE FUNCTION ---------- */
function mergeSymptoms(local = {}, cloud = {}) {
  const merged = { ...cloud }; // ✅ CLOUD FIRST

  Object.keys(local).forEach((date) => {
    if (!merged[date]) {
      merged[date] = local[date];
    }
  });

  return merged;
}

/* ---------- AUTO SYNC ---------- */

export function initAutoSync(userId) {
  if (!userId) return;

  console.log("⚡ Auto sync initialized");

  // 1️⃣ Sync on app start
  pullFromCloud(userId);

  // 2️⃣ Sync when internet comes back
  window.addEventListener("online", () => {
    console.log("🌐 Back online → syncing...");
    pullFromCloud(userId);
  });
}
