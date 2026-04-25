import { useEffect, useState } from "react";
import { generatePhaseInsights } from "../insights/insightsUtils";
import { useUser } from "../context/UserContext";

/* 🔥 STEP 3B – Trend Helper */
function getTrendInsights(phaseSymptoms) {
  let symptomTotals = {};

  Object.values(phaseSymptoms).forEach((symptoms) => {
    Object.keys(symptoms).forEach((symptom) => {
      symptomTotals[symptom] =
        (symptomTotals[symptom] || 0) + symptoms[symptom];
    });
  });

  const sorted = Object.entries(symptomTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  return {
    topTrends: sorted.slice(0, 2),
    hasData: sorted.length > 0,
  };
}

export default function Insights() {
  const [insights, setInsights] = useState(null);
  const { user, userType } = useUser();

  useEffect(() => {
    const scope = {
      userId: user ? user.uid : "guest",
      userType: user ? "authenticated" : "guest",
    };

    const data = generatePhaseInsights(scope);
    setInsights(data);
  }, [user, userType]);

  if (!insights) {
    return (
      <div className="p-6 text-center text-gray-500">
        Log symptoms to unlock insights 🌸
      </div>
    );
  }

  const { dominantPhase, topSymptom, summary, phaseSymptoms } = insights;

  /* 🔥 Step 3B data */
  const trendData = getTrendInsights(phaseSymptoms);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-pink-600">
          Your Cycle Insights ✨
        </h2>
        <p className="text-sm text-gray-500">Based on your past symptom logs</p>
      </div>

      {/* Summary Card */}
      <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4">
        <p className="text-sm text-pink-700">💡 {summary}</p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Dominant Phase</p>
          <p className="text-lg font-semibold text-gray-800">{dominantPhase}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Top symptom</p>

          <h3 className="text-xl font-semibold text-lavender">
            {topSymptom || "—"}
          </h3>

          {topSymptom && (
            <p className="mt-1 text-xs text-gray-500">
              Based on your past symptom logs
            </p>
          )}
        </div>
      </div>

      {/* Phase Breakdown (NO NUMBERS — CLEAN UX) */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-600">Symptoms by Phase</h3>

        {Object.entries(phaseSymptoms).map(([phase, symptoms]) => {
          const symptomNames = Object.keys(symptoms);
          if (symptomNames.length === 0) return null;

          return (
            <div key={phase} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm font-semibold text-pink-600 mb-2">
                {phase}
              </p>

              <div className="flex flex-wrap gap-2">
                {symptomNames.map((symptom) => (
                  <span
                    key={symptom}
                    className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 STEP 3B – Trends Over Time */}
      {trendData.hasData && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <h3 className="text-sm font-medium text-gray-600">
            Trends over time
          </h3>

          <p className="text-sm text-gray-700">
            Over time, your most common symptoms are{" "}
            <span className="font-medium">
              {trendData.topTrends.join(" and ")}
            </span>
            .
          </p>

          <p className="text-xs text-gray-400">
            Based on patterns across multiple cycles
          </p>
        </div>
      )}
    </div>
  );
}
