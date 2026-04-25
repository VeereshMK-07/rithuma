// src/insights/trendsUtils.js

import { calculateCyclePhases } from "../utils/cycleUtils";
import { readData } from "../utils/storageService";

export function analyzeSymptomTrends() {
  // 🔐 Centralized reads
  const symptomData = readData("rithuma_symptoms") || {};

  const lastPeriod = readData("rithuma_last_period");
  const cycleLength =
    Number(readData("rithuma_cycle_length")) || 28;

  // Guard clause
  if (!lastPeriod || Object.keys(symptomData).length === 0) {
    return [];
  }

  const cycle = calculateCyclePhases(lastPeriod, cycleLength);
  const phaseCountMap = {};

  // 1️⃣ Count symptom occurrences per phase
  Object.entries(symptomData).forEach(([date, symptoms]) => {
    const day = new Date(date);
    let phase = "Luteal";

    if (day >= cycle.period.start && day <= cycle.period.end) {
      phase = "Menstrual";
    } else if (
      day >= cycle.fertileWindow.start &&
      day < cycle.ovulationDay
    ) {
      phase = "Follicular";
    } else if (
      day.toDateString() ===
      cycle.ovulationDay.toDateString()
    ) {
      phase = "Ovulation";
    }

    symptoms.forEach((symptom) => {
      if (!phaseCountMap[symptom]) {
        phaseCountMap[symptom] = {};
      }

      phaseCountMap[symptom][phase] =
        (phaseCountMap[symptom][phase] || 0) + 1;
    });
  });

  // 2️⃣ Convert counts → insights with confidence
  return Object.entries(phaseCountMap)
    .map(([symptom, phaseCounts]) => {
      const sorted = Object.entries(phaseCounts).sort(
        (a, b) => b[1] - a[1]
      );

      const [dominantPhase, count] = sorted[0];

      // 🔥 Confidence logic
      let confidence = "Emerging pattern";
      if (count >= 4) confidence = "Strong pattern";

      return {
        id: `trend_${symptom
          .toLowerCase()
          .replace(/\s+/g, "_")}`,
        title: `${symptom} pattern noticed`,
        message: `${symptom} appears most often during your ${dominantPhase.toLowerCase()} phase.`,
        phase: dominantPhase,
        confidence,
        count,
      };
    })
    // 3️⃣ Remove noise
    .filter((trend) => trend.count >= 2)
    // 4️⃣ Strongest first
    .sort((a, b) => b.count - a.count);
}
