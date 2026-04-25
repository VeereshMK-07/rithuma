import { useState, useEffect } from "react";
import { calculateCyclePhases, getCyclePhase } from "../utils/cycleUtils";
import { generatePhaseInsights } from "../insights/insightsUtils";
import { readData, writeData } from "../utils/storageService";
import { useUser } from "../context/UserContext";
import { getDateKey } from "../utils/dateKey";

/* ---------- FIX: LOCAL DATE KEY ---------- */
// function getLocalDateKey(date) {
//   const d = new Date(date);
//   d.setHours(0, 0, 0, 0);
//   return d.toLocaleDateString("en-CA");
// }

const SYMPTOMS_LIST = [
  "Cramps",
  "Headache",
  "Bloating",
  "Fatigue",
  "Mood swings",
  "Acne",
  "Back pain",
];

function getPhaseInsight(phase) {
  switch (phase) {
    case "Menstrual":
      return "Your body is resting. Prioritize comfort and hydration 🩸";
    case "Follicular":
      return "Energy is rising. A great time to start fresh 🌱";
    case "Ovulation":
      return "You may feel confident and social today 🌸";
    case "Luteal":
      return "Slow down and focus on self-care 🌙";
    default:
      return "Track your cycle to unlock insights 🌸";
  }
}

function getPhaseStyle(phase) {
  switch (phase) {
    case "Menstrual":
      return "bg-pink-300 text-white";
    case "Follicular":
      return "bg-emerald-200 text-gray-800";
    case "Ovulation":
      return "bg-green-500 text-white";
    case "Luteal":
      return "bg-amber-200 text-gray-800";
    default:
      return "bg-white border border-gray-300 text-gray-700"; // ✅ FIX
  }
}

export default function Calendar() {
  const { user } = useUser();

  const scope = {
    userId: user ? user.uid : "guest",
    userType: user ? "authenticated" : "guest",
  };

  const [lastPeriodDate, setLastPeriodDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [symptoms, setSymptoms] = useState({});

  useEffect(() => {
    const data = readData("rithuma_last_period", scope);
    setLastPeriodDate(data ? new Date(data) : null);
  }, [user]);

  useEffect(() => {
    const stored = readData("rithuma_symptoms", scope) || {};
    setSymptoms(stored);
  }, [user]);

  if (!lastPeriodDate) {
    return (
      <div className="p-6 text-center text-gray-500">
        Log your period to see your cycle insights 🌸
      </div>
    );
  }

  const cycleLength = Number(readData("rithuma_cycle_length", scope)) || 28;
  const cycle = calculateCyclePhases(lastPeriodDate, cycleLength);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function toggleSymptom(symptom) {
    if (!selectedDate) return;

    const key = getDateKey(selectedDate);
    const existing = symptoms[key] || [];

    const updated = existing.includes(symptom)
      ? existing.filter((s) => s !== symptom)
      : [...existing, symptom];

    const newSymptoms = { ...symptoms, [key]: updated };

    setSymptoms(newSymptoms);
    writeData("rithuma_symptoms", newSymptoms, scope);
  }

  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const phase = selectedDate ? getCyclePhase(selectedDate, cycle) : null;

  const selectedKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedSymptoms = selectedKey ? symptoms[selectedKey] || [] : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => {
          const dayPhase = getCyclePhase(date, cycle);
          const isSelected =
            selectedDate && date.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={date.toDateString()}
              onClick={() => setSelectedDate(date)}
              className={`h-10 w-10 rounded-full flex items-center justify-center text-sm
                ${getPhaseStyle(dayPhase)}
                ${isSelected ? "ring-2 ring-pink-600 ring-offset-2" : ""}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
          <p className="text-sm text-gray-500">{selectedDate.toDateString()}</p>

          <h3 className="text-lg font-semibold text-pink-600">{phase} Phase</h3>

          <p className="text-sm text-gray-700">{getPhaseInsight(phase)}</p>

          <div>
            <p className="text-sm text-gray-500 mb-2">
              Tap symptoms you're experiencing
            </p>

            <div className="flex flex-wrap gap-2">
              {SYMPTOMS_LIST.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);

                return (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-3 py-1 rounded-full text-sm border
                      ${
                        isSelected
                          ? "bg-pink-200 text-pink-700 border-pink-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {symptom}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 text-sm mt-2">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-pink-300 rounded-full"></span> Menstrual
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-emerald-200 rounded-full"></span>{" "}
          Follicular
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span> Ovulation
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-amber-200 rounded-full"></span> Luteal
        </div>
      </div>
    </div>
  );
}
