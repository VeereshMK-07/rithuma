

function normalize(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function calculateCyclePhases(lastPeriodDate, cycleLength = 28) {
  const start = normalize(lastPeriodDate);

  const periodEnd = new Date(start);
  periodEnd.setDate(start.getDate() + 4);

  const ovulationDay = new Date(start);
  ovulationDay.setDate(start.getDate() + cycleLength - 14);

  const fertileStart = new Date(ovulationDay);
  fertileStart.setDate(ovulationDay.getDate() - 5);

  const nextPeriod = new Date(start);
  nextPeriod.setDate(start.getDate() + cycleLength);

  return {
    period: { start, end: normalize(periodEnd) },
    fertileWindow: { start: normalize(fertileStart), end: normalize(ovulationDay) },
    ovulationDay: normalize(ovulationDay),
    nextPeriod: normalize(nextPeriod),
  };
}

/**
 * ✅ SINGLE SOURCE OF TRUTH
 */
export function getCyclePhase(date, cycle) {
  if (!cycle) return "Unknown";

  const d = normalize(date);

  if (d >= cycle.period.start && d <= cycle.period.end) {
    return "Menstrual";
  }

  if (d > cycle.period.end && d < cycle.fertileWindow.start) {
    return "Follicular";
  }

  if (d >= cycle.fertileWindow.start && d <= cycle.ovulationDay) {
    return "Ovulation";
  }

  if (d > cycle.ovulationDay && d < cycle.nextPeriod) {
    return "Luteal";
  }

  return "Unknown";
}
