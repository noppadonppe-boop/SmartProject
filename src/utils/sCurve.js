// Compute cumulative Planned vs Actual S-Curve data from the task list.
// Weight is distributed evenly across each task's months, then normalized to
// the total weight so the planned curve reaches 100%.

import { monthIndexFromStart, buildMonthBands, totalDays } from './dateUtils'

export function computeSCurve(tasks, projectStartISO, projectEndISO) {
  const bands = buildMonthBands(projectStartISO, projectEndISO)
  const totalMonths = bands.length
  const span = totalDays(projectStartISO, projectEndISO)
  const plan = new Array(totalMonths).fill(0)
  const actual = new Array(totalMonths).fill(0)

  const real = tasks.filter((t) => !t.isHeader && t.weight > 0)
  const totalWeight = real.reduce((s, t) => s + t.weight, 0) || 1

  let dataDateIdx = -1

  for (const t of real) {
    // Planned spread
    const ps = monthIndexFromStart(projectStartISO, t.planStartDate)
    const pe = monthIndexFromStart(projectStartISO, t.planEndDate)
    if (ps != null && pe != null && pe >= ps) {
      const per = t.weight / (pe - ps + 1)
      for (let m = ps; m <= pe && m < totalMonths; m++) if (m >= 0) plan[m] += per
    }

    // Actual spread (earned value = weight * actualProgress)
    const aProg = Number(t.actualProgress) || 0
    const as = monthIndexFromStart(projectStartISO, t.actualStartDate)
    let ae = monthIndexFromStart(projectStartISO, t.actualEndDate)
    if (aProg > 0 && as != null) {
      if (ae == null || ae < as) ae = as
      const earned = (t.weight * aProg) / 100
      const per = earned / (ae - as + 1)
      for (let m = as; m <= ae && m < totalMonths; m++) if (m >= 0) actual[m] += per
      if (ae > dataDateIdx) dataDateIdx = ae
    }
  }

  let cumP = 0
  let cumA = 0
  const rows = []
  for (let i = 0; i < totalMonths; i++) {
    cumP += plan[i]
    cumA += actual[i]
    const b = bands[i]
    rows.push({
      month: `M${i + 1}`,
      monthIndex: i + 1,
      // day offset at month end — used to position the curve on the day-based axis
      dayOffset: b.startOffset + b.days - 1,
      planned: +((cumP / totalWeight) * 100).toFixed(1),
      actual: i <= dataDateIdx ? +((cumA / totalWeight) * 100).toFixed(1) : null,
    })
  }
  return { rows, dataDateIdx, totalDays: span, bands }
}
