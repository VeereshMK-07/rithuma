import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { readData, writeData } from "../utils/storageService";
import { useUser } from "../context/UserContext";
import { pushToCloud } from "../utils/cloudSyncService";
import { getDateKey } from "../utils/dateKey";

const symptomsList = [
  "Cramps",
  "Headache",
  "Fatigue",
  "Mood swings",
  "Bloating",
  "Back pain",
  "White discharge",
];

export default function LogSymptoms({}) {
  const { user, userType } = useUser();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");

  /* ---------- Load today's saved symptoms ---------- */

  useEffect(() => {
    const today = getDateKey();

    const existing =
      readData("rithuma_symptoms", {
        userId: user?.uid,
      }) || {};

    if (existing[today]) {
      setSelected(existing[today]);
    }
  }, [user]);

  /* ---------- Toggle ---------- */

  function toggle(symptom) {
    setSelected((prev) => {
      if (prev.includes(symptom)) return prev.filter((s) => s !== symptom);

      if (prev.length >= 4) {
        alert("You can select up to 4 symptoms.");
        return prev;
      }

      return [...prev, symptom];
    });
  }

  /* ---------- Save ---------- */

  async function handleSave() {
    if (!selected.length) {
      alert("Select at least one symptom 🌸");
      return;
    }

    setIsSaving(true);
    setSyncStatus("syncing");

    try {
      const today = getDateKey();

      const scope = {
        userId: user ? user.uid : "guest",
        userType: user ? "authenticated" : "guest",
      };

      const existing = readData("rithuma_symptoms", scope) || {};

      const updated = {
        ...existing,
        [today]: selected,
      };

      // ✅ ONLY THIS (REMOVE duplicate scope above)
      writeData("rithuma_symptoms", updated, scope);

      const result = await pushToCloud(user?.uid, {
        symptoms: updated,
      });

      if (result?.success) {
        setSyncStatus("success");

        setTimeout(() => {
          navigate("/");
          window.location.reload();
        }, 1500);
      } else {
        setSyncStatus("failed");
      }
    } catch (err) {
      console.error("Save failed:", err);
      setSyncStatus("failed");
    } finally {
      setIsSaving(false);
    }
  }

  /* ---------- UI ---------- */

  return (
    <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-lavender mb-4">Log symptoms</h2>
      <div className="grid grid-cols-2 gap-3">
        {symptomsList.map((symptom) => (
          <button
            key={symptom}
            onClick={() => toggle(symptom)}
            className={`rounded-xl px-3 py-2 text-sm border ${
              selected.includes(symptom)
                ? "bg-lavender text-white border-lavender"
                : "border-lilac text-gray-700"
            }`}
          >
            {symptom}
          </button>
        ))}
      </div>
      <Button className="mt-6 w-full" onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </Button>
      {syncStatus === "syncing" && (
        <p className="text-sm text-gray-500 mt-2">Syncing to cloud...</p>
      )}
      -
      {syncStatus === "success" && (
        <p className="text-sm text-green-600 mt-2">Synced successfully ✅</p>
      )}
      {syncStatus === "failed" && (
        <p className="text-sm text-red-500 mt-2">Sync failed. Will retry 🔁</p>
      )}
    </div>
  );
}
