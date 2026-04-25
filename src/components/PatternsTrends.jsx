import { useEffect, useState } from "react";
import { analyzeSymptomTrends } from "../insights/trendsUtils";

/* ------------------ Phase emoji map ------------------ */

const PHASE_EMOJI = {
  Menstrual: "🩸",
  Follicular: "🌱",
  Ovulation: "✨",
  Luteal: "🌙",
};

export default function PatternsTrends() {
  const [trends, setTrends] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const results = analyzeSymptomTrends();
    setTrends(results);
  }, []);

  if (trends.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-gray-600">
          Log symptoms over time to unlock pattern insights 🌱
        </p>
      </div>
    );
  }

  const visibleTrends = showAll ? trends : trends.slice(0, 3);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-lavender">
        Patterns & Trends
      </h2>

      {/* 🧠 Context explanation */}
      <p className="text-sm text-gray-600">
        These patterns are based on symptoms you’ve logged over time.
        They highlight which phase certain symptoms appear most often.
      </p>

      {visibleTrends.map((trend) => (
        <div
          key={trend.id}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-800 mb-1 flex items-center gap-2">
            {trend.title} {PHASE_EMOJI[trend.phase]}

            {/* ✅ Confidence badge */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                trend.confidence === "Strong pattern"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {trend.confidence}
            </span>
          </p>

          <p className="text-sm text-gray-600">
            {trend.message}
          </p>
        </div>
      ))}

      {/* 🔽 View more / less toggle */}
      {trends.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-lavender font-medium hover:underline self-start"
        >
          {showAll ? "Show fewer patterns" : "View more patterns"}
        </button>
      )}
    </div>
  );
}
