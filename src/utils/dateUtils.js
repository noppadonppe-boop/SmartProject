// Date / month-geometry helpers for the Gantt timeline.

// Number of whole months from project start to a given ISO date (0-based).
// e.g. project start 2025-01-01, date 2025-03-15 -> 2.
export function monthIndexFromStart(projectStartISO, dateISO) {
  if (!dateISO) return null
  const start = new Date(projectStartISO)
  const d = new Date(dateISO)
  return (d.getFullYear() - start.getFullYear()) * 12 + (d.getMonth() - start.getMonth())
}

// Fractional position within the timeline (in months) for precise bar edges.
export function monthFraction(projectStartISO, dateISO) {
  if (!dateISO) return null
  const start = new Date(projectStartISO)
  const d = new Date(dateISO)
  const whole = (d.getFullYear() - start.getFullYear()) * 12 + (d.getMonth() - start.getMonth())
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  return whole + (d.getDate() - 1) / daysInMonth
}

// Build month labels: ["M1","M2",...] plus calendar label "Jan".
export function buildMonths(projectStartISO, totalMonths) {
  const out = []
  for (let i = 0; i < totalMonths; i++) {
    const d = new Date(projectStartISO)
    d.setMonth(d.getMonth() + i)
    out.push({
      index: i + 1,
      label: `M${i + 1}`,
      calendar: d.toLocaleDateString('en-US', { month: 'short' }),
    })
  }
  return out
}

// Inclusive month count between two dates (for duration display).
export function durationMonths(startISO, endISO) {
  if (!startISO || !endISO) return 0
  const s = new Date(startISO)
  const e = new Date(endISO)
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth())
  return months + 1
}

const MS_PER_DAY = 86400000

// Whole-day offset of `dateISO` from `startISO` (0-based, can be negative).
export function dayOffset(startISO, dateISO) {
  if (!dateISO) return null
  const s = new Date(startISO)
  const d = new Date(dateISO)
  return Math.round((d - s) / MS_PER_DAY)
}

// Inclusive number of days between start and end.
export function totalDays(startISO, endISO) {
  return (dayOffset(startISO, endISO) ?? 0) + 1
}

// ISO date `off` days after `startISO`.
export function dateFromOffset(startISO, off) {
  const d = new Date(startISO)
  d.setDate(d.getDate() + off)
  return d.toISOString().slice(0, 10)
}

// List of month band descriptors between start and end (inclusive).
// Each: { index, label, calendar, startOffset (days), days }.
export function buildMonthBands(startISO, endISO) {
  const start = new Date(startISO)
  const end = new Date(endISO)
  const bands = []
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  let i = 0
  while (cursor <= end) {
    const monthFirst = cursor
    const monthLast = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
    const from = monthFirst < start ? start : monthFirst
    const to = monthLast > end ? end : monthLast
    bands.push({
      index: ++i,
      label: `M${i}`,
      calendar: cursor.toLocaleDateString('en-US', { month: 'short' }),
      startOffset: dayOffset(startISO, from.toISOString().slice(0, 10)),
      days: Math.round((to - from) / MS_PER_DAY) + 1,
    })
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }
  return bands
}

// Weekly band descriptors (7-day buckets from project start).
export function buildWeekBands(startISO, endISO) {
  const total = totalDays(startISO, endISO)
  const bands = []
  for (let off = 0, w = 1; off < total; off += 7, w++) {
    bands.push({
      index: w,
      label: `W${w}`,
      startOffset: off,
      days: Math.min(7, total - off),
    })
  }
  return bands
}

export function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
