// CSV export of the WBS task list + a cumulative S-curve summary.

function esc(v) {
  if (v == null) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportTasksCsv(project, tasks, sCurve) {
  const cols = [
    'WBS', 'Task Name', 'Category', 'Weight%', 'Milestone', 'Resource',
    'Plan Start', 'Plan End', 'Plan %',
    'Actual Start', 'Actual End', 'Actual %',
    'Dependencies', 'Note',
  ]
  const rows = tasks.map((t) =>
    [
      t.wbsCode, t.taskName, t.isHeader ? 'header' : t.group, t.weight,
      t.milestone ? 'Yes' : '', t.resource,
      t.planStartDate, t.planEndDate, t.planProgress,
      t.actualStartDate, t.actualEndDate, t.actualProgress,
      (t.dependencies || []).join(' | '), t.taskNote,
    ].map(esc).join(',')
  )

  const sCurveHeader = ['', 'Month', 'Cumulative Planned %', 'Cumulative Actual %']
  const sCurveRows = (sCurve?.rows || []).map((r) =>
    ['', r.month, r.planned, r.actual ?? ''].map(esc).join(',')
  )

  const lines = [
    `Project,${esc(project?.name)}`,
    `Owner,${esc(project?.owner)}`,
    `Duration,${esc(project?.startDate)} to ${esc(project?.endDate)}`,
    '',
    cols.join(','),
    ...rows,
    '',
    'S-CURVE SUMMARY',
    sCurveHeader.join(','),
    ...sCurveRows,
  ]

  const safeName = (project?.name || 'project').replace(/[^a-z0-9]+/gi, '_')
  download(`${safeName}_schedule.csv`, lines.join('\n'))
}
