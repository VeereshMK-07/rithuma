import { calculateCyclePhases } from "../utils/cycleUtils";
import TodayInsights from "./TodayInsights";
import PrivacyNotice from "../components/PrivacyNotice";
import { readData } from "../utils/storageService";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";

/* ---------- PHASE HELPER ---------- */

function getTodayPhase(date, cycleData) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const { period, fertileWindow, ovulationDay } = cycleData;

  if (d >= period.start && d <= period.end) return "Menstrual 🩸";
  if (d >= fertileWindow.start && d <= fertileWindow.end) return "Fertile 🌿";
  if (d.toDateString() === ovulationDay.toDateString()) return "Ovulation 🌸";
  return "Luteal 🌙";
}

/* ---------- COMPONENT ---------- */

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, userType } = useUser();

  const [lastPeriodDate, setLastPeriodDate] = useState(null);
  const [cycleLength, setCycleLength] = useState(28);

  /* ---------- LOAD DATA ---------- */

  const loadData = () => {
    const scope = {
      userId: user ? user.uid : "guest",
      userType: user ? "authenticated" : "guest",
    };

    const periodRaw = readData("rithuma_last_period", scope);
    const period = periodRaw ? new Date(periodRaw) : null;

    const length =
      Number(readData("rithuma_cycle_length", scope)) || 28;

    setLastPeriodDate(period);
    setCycleLength(length);
  };

  useEffect(() => {
    loadData();
  }, [user, userType]);

  /* ---------- CALCULATIONS ---------- */

  const cycleData =
    lastPeriodDate && cycleLength
      ? calculateCyclePhases(lastPeriodDate, cycleLength)
      : null;

  const today = new Date();

  /* ---------- UI ---------- */

  return (
    <div className="mt-6 space-y-6">
      <PrivacyNotice />


      <TodayInsights />

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/log-period")}
          className="bg-lilac rounded-xl p-4"
        >
          Log Period
        </button>

        <button
          onClick={() => navigate("/log-symptoms")}
          className="bg-mint rounded-xl p-4"
        >
          Log Symptoms
        </button>
      </div>
    </div>
  );
}