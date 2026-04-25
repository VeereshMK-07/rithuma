import {
  secureGet,
  secureSet,
  secureRemove,
} from "./secureStorage";

const DATA_KEYS = [
  "rithuma_last_period",
  "rithuma_cycle_length",
  "rithuma_symptoms",
  "rithuma_nudge_feedback",
];

/* ------------------ Read all data ------------------ */

export async function getAllRithumaData() {
  const data = {};

  for (const key of DATA_KEYS) {
    const value = await secureGet(key);
    if (value !== null) {
      data[key] = value;
    }
  }

  return data;
}

/* ------------------ Write helpers ------------------ */

export async function setRithumaData(key, value) {
  if (!DATA_KEYS.includes(key)) return;
  await secureSet(key, value);
}

/* ------------------ Clear all ------------------ */

export function clearAllRithumaData() {
  DATA_KEYS.forEach((key) => secureRemove(key));
}
