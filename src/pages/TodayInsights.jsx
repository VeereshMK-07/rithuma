import { useEffect, useState } from "react";
import { calculateCyclePhases, getCyclePhase } from "../utils/cycleUtils";
import { generatePredictiveInsights } from "../insights/predictiveInsights";
import PatternsTrends from "../components/PatternsTrends";
import { readData, writeData } from "../utils/storageService";
import { useUser } from "../context/UserContext";
import { getDateKey } from "../utils/dateKey";

const PHASE_EMOJI = {
  Menstrual: "🩸",
  Follicular: "🌱",
  Ovulation: "✨",
  Luteal: "🌙",
};

const FEEDBACK_KEY = "rithuma_nudge_feedback";

export default function TodayInsights() {
  const { user, userType } = useUser();

  const [phase, setPhase] = useState(null);
  const [daysLeft, setDaysLeft] = useState(null);
  const [todaySymptoms, setTodaySymptoms] = useState([]);
  const [activeNudge, setActiveNudge] = useState(null);

  /* ---------- Feedback Helpers (SCOPED) ---------- */

  function getNudgeFeedback() {
    const scope = {
      userId: user ? user.uid : "guest",
      userType,
    };

    return readData(FEEDBACK_KEY, scope) || {};
  }

  function saveNudgeFeedback(nudgeId, action) {
    const stored = getNudgeFeedback();
    const prev = stored[nudgeId] || { helpful: 0, dismissed: false };

    const updated = {
      ...stored,
      [nudgeId]: {
        ...prev,
        dismissed: action === "dismiss" ? true : prev.dismissed,
        helpful: action === "helpful" ? prev.helpful + 1 : prev.helpful,
        lastSeen: new Date().toISOString(),
      },
    };

    const scope = {
      userId: user ? user.uid : "guest",
      userType,
    };

    writeData(FEEDBACK_KEY, updated, scope);
  }

  /* ---------- Daily Tip ---------- */

  function getDailyTip(phase) {
    const tips = {
      Menstrual: "Rest and hydration matter most today 🩸",
      Follicular: "Energy is rising. Great time to plan 🌱",
      Ovulation: "You may feel confident today ✨",
      Luteal: "Slow down and focus on self-care 🌙",
    };

    return tips[phase] || "Track your cycle to unlock insights 🌸";
  }

  /* ---------- Load Cycle + Symptoms (SCOPED) ---------- */

  useEffect(() => {
    const scope = {
      userId: user ? user.uid : "guest",
      userType: user ? "authenticated" : "guest",
    };

    const lastPeriod = readData("rithuma_last_period", scope);
    if (!lastPeriod) return;

    const cycleLength = Number(readData("rithuma_cycle_length", scope)) || 28;

    const cycle = calculateCyclePhases(lastPeriod, cycleLength);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = getDateKey(today);

    setPhase(getCyclePhase(today, cycle));

    setDaysLeft(Math.ceil((cycle.nextPeriod - today) / 86400000));

    const storedSymptoms = readData("rithuma_symptoms", scope) || {};

    setTodaySymptoms(storedSymptoms[todayKey] || []);
  }, [user, userType]);

  /* ---------- Load Nudges ---------- */

  useEffect(() => {
    const nudges = generatePredictiveInsights();
    const feedback = getNudgeFeedback();

    const available = nudges.filter((n) => !feedback[n.id]?.dismissed);

    setActiveNudge(available[0] || null);
  }, [user]);

  /* ---------- UI ---------- */

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl font-semibold text-lavender">Insights</h2>

      {activeNudge && (
        <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
          <p className="text-sm font-medium text-pink-700 mb-1">
            {activeNudge.title}
          </p>

          <p className="text-sm text-gray-700 mb-2">{activeNudge.message}</p>

          <p className="text-sm text-pink-600 mb-3">💡 {activeNudge.action}</p>

          <div className="flex gap-4 text-xs text-gray-500">
            <button
              onClick={() => saveNudgeFeedback(activeNudge.id, "helpful")}
              className="hover:text-green-600"
            >
              👍 Helpful
            </button>

            <button
              onClick={() => {
                saveNudgeFeedback(activeNudge.id, "dismiss");
                setActiveNudge(null);
              }}
              className="hover:text-gray-600"
            >
              ✖ Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-gray-500">Current phase</p>
        <h3 className="text-2xl font-semibold text-lavender">
          {phase && `${phase} ${PHASE_EMOJI[phase]}`}
        </h3>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-gray-500">Daily tip</p>
        <p className="text-gray-700">{getDailyTip(phase)}</p>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-gray-500">Today’s symptoms</p>
        <p>
          {todaySymptoms.length
            ? todaySymptoms.join(", ")
            : "No symptoms logged"}
        </p>
      </div>

      <PatternsTrends />
    </div>
  );
}
