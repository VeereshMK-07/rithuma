import {
  calculateCyclePhases,
  getCyclePhase,
} from "../utils/cycleUtils";
import { generatePhaseInsights } from "./insightsUtils";
import { readData } from "../utils/storageService";

/**
 * Generates gentle, predictive nudges
 * - Stable IDs (critical for dismiss persistence)
 * - Phase-aware
 * - ONE nudge at a time
 */
export function generatePredictiveInsights() {
  const nudges = [];

  const lastPeriod = readData("rithuma_last_period");
  const cycleLength =
    Number(readData("rithuma_cycle_length")) || 28;

  if (!lastPeriod) return nudges;

  const cycle = calculateCyclePhases(lastPeriod, cycleLength);
  const phaseInsights = generatePhaseInsights();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentPhase = getCyclePhase(today, cycle);

  const daysToNextPeriod = Math.ceil(
    (cycle.nextPeriod - today) / (1000 * 60 * 60 * 24)
  );

  /* --------------------------------------------------
   🩸 RULE 1 — PHASE-BASED NUDGES (highest priority)
  -------------------------------------------------- */

  if (currentPhase === "Menstrual") {
    nudges.push({
      id: "menstrual_rest",
      phase: "Menstrual",
      title: "Rest & restore 🩸",
      message:
        "Your body is in its menstrual phase, where energy is naturally lower.",
      action:
        "Prioritize rest, hydration, and gentle movement today.",
      reason: "cycle phase",
    });
  }

  if (currentPhase === "Luteal") {
    nudges.push({
      id: "luteal_slow_down",
      phase: "Luteal",
      title: "Slow down gently 🌙",
      message:
        "During the luteal phase, mood and energy fluctuations are common.",
      action:
        "Reduce workload and choose calming routines.",
      reason: "cycle phase",
    });
  }

  if (currentPhase === "Follicular") {
    nudges.push({
      id: "follicular_plan_ahead",
      phase: "Follicular",
      title: "Energy rising 🌱",
      message:
        "You may feel more motivated and focused during this phase.",
      action:
        "Plan ahead or start something new.",
      reason: "cycle phase",
    });
  }

  if (currentPhase === "Ovulation") {
    nudges.push({
      id: "ovulation_connect",
      phase: "Ovulation",
      title: "You’re in sync ✨",
      message:
        "This phase often brings confidence and clarity.",
      action:
        "Great time for communication or important conversations.",
      reason: "cycle phase",
    });
  }

  /* --------------------------------------------------
   💡 RULE 2 — SYMPTOM-BASED NUDGE (secondary)
  -------------------------------------------------- */

  if (phaseInsights?.topSymptom) {
    const symptomKey = phaseInsights.topSymptom
      .toLowerCase()
      .replace(/\s+/g, "_");

    nudges.push({
      id: `symptom_${symptomKey}`,
      phase: currentPhase,
      title: "Pattern noticed 💡",
      message: `You often experience ${phaseInsights.topSymptom.toLowerCase()} around this time.`,
      action:
        "Planning ahead or adjusting routines may help.",
      reason: "past symptoms",
    });
  }

  /* --------------------------------------------------
   ⏳ RULE 3 — PERIOD APPROACHING (lowest priority)
  -------------------------------------------------- */

  if (daysToNextPeriod <= 3 && daysToNextPeriod > 0) {
    nudges.push({
      id: "period_approaching",
      phase: "Luteal",
      title: "Period approaching 🌸",
      message: `Your next period is expected in ${daysToNextPeriod} day${
        daysToNextPeriod > 1 ? "s" : ""
      }.`,
      action:
        "Prepare pads/cups and plan lighter days if possible.",
      reason: "cycle timing",
    });
  }

  /* --------------------------------------------------
   🎯 FINAL — return ONLY ONE nudge
  -------------------------------------------------- */

  return nudges.slice(0, 1);
}
