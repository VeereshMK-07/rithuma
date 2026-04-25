import CryptoJS from "crypto-js";
import { calculateCyclePhases } from "../utils/cycleUtils";
import { readData } from "../utils/storageService";

/* ------------------ Secure storage helpers ------------------ */

function getCryptoKey() {
  return localStorage.getItem("rithuma_crypto_key");
}

function decrypt(value, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(value, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

function getSecureItem(key) {
  const encrypted = localStorage.getItem(`enc_${key}`);
  if (encrypted) {
    const cryptoKey = getCryptoKey();
    if (!cryptoKey) return null;
    return decrypt(encrypted, cryptoKey);
  }

  const raw = localStorage.getItem(key);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return raw;
  }
}

function getScopedKey(baseKey, scope) {
  const suffix =
    scope?.userType === "authenticated"
      ? scope.userId
      : "guest";

  return `enc_${suffix}_${baseKey}`;
}

function getSecureScopedData(baseKey, scope) {
  const key = getScopedKey(baseKey, scope);
  const encrypted = localStorage.getItem(key);

  if (!encrypted) return null;

  const cryptoKey = getCryptoKey();
  if (!cryptoKey) return null;

  return decrypt(encrypted, cryptoKey);
}

/* ------------------ Date helpers ------------------ */

function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDate(dateStr) {
  return normalizeDate(new Date(dateStr));
}

/* ------------------ Phase resolver ------------------ */

function getPhaseForDate(date, cycle) {
  const d = normalizeDate(date);

  const periodStart = normalizeDate(cycle.period.start);
  const periodEnd = normalizeDate(cycle.period.end);
  const fertileStart = normalizeDate(cycle.fertileWindow.start);
  const ovulation = normalizeDate(cycle.ovulationDay);
  const nextPeriod = normalizeDate(cycle.nextPeriod);

  if (
    (d >= periodStart && d <= periodEnd) ||
    d.getTime() === nextPeriod.getTime()
  ) {
    return "Menstrual";
  }

  if (d > periodEnd && d < fertileStart) return "Follicular";
  if (d >= fertileStart && d <= ovulation) return "Ovulation";
  if (d > ovulation && d < nextPeriod) return "Luteal";

  return "Unknown";
}

/* ------------------ Core Insights Generator ------------------ */

export function generatePhaseInsights(scope) {
const lastPeriodDate = getSecureScopedData("rithuma_last_period", scope);
const symptomsByDate = getSecureScopedData("rithuma_symptoms", scope);

  if (!lastPeriodDate || !symptomsByDate) {
    return {
      phaseSymptoms: {},
      topSymptom: null,
      dominantPhase: null,
      summary: null,
    };
  }

  const cycle = calculateCyclePhases(new Date(lastPeriodDate));

  const phaseSymptoms = {};
  const symptomTotals = {};
  const phaseTotals = {};

  Object.entries(symptomsByDate).forEach(([dateStr, symptoms]) => {
    const date = parseDate(dateStr);
    const phase = getPhaseForDate(date, cycle);

    if (phase === "Unknown") return;

    phaseSymptoms[phase] ??= {};
    phaseTotals[phase] ??= 0;

    symptoms.forEach((symptom) => {
      phaseSymptoms[phase][symptom] = (phaseSymptoms[phase][symptom] || 0) + 1;

      symptomTotals[symptom] = (symptomTotals[symptom] || 0) + 1;

      phaseTotals[phase] += 1;
    });
  });

  const topSymptom =
    Object.entries(symptomTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const dominantPhase =
    Object.entries(phaseTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  let summary = null;
  if (topSymptom && dominantPhase) {
    summary = `You tend to experience ${topSymptom.toLowerCase()} more often during your ${dominantPhase.toLowerCase()} phase.`;
  }

  return {
    phaseSymptoms,
    topSymptom,
    dominantPhase,
    summary,
  };
}
