// Critical Path Method (CPM) over finish-to-start dependencies.
// Works on day offsets from the project start. Returns the set of critical
// task ids and the total float (slack, in days) per task.

import { dayOffset } from './dateUtils'

export function computeCriticalPath(tasks, projectStartISO) {
  const real = tasks.filter((t) => !t.isHeader && t.planStartDate && t.planEndDate)
  const byId = new Map(real.map((t) => [t.id, t]))

  const dur = (t) => {
    const s = dayOffset(projectStartISO, t.planStartDate)
    const e = dayOffset(projectStartISO, t.planEndDate)
    return Math.max((e ?? s) - s + 1, 1)
  }

  // Successors map (invert dependencies that point to existing tasks).
  const successors = new Map(real.map((t) => [t.id, []]))
  for (const t of real) {
    for (const dep of t.dependencies || []) {
      if (byId.has(dep)) successors.get(dep).push(t.id)
    }
  }

  // Forward pass — earliest start/finish (memoized, cycle-guarded).
  const ES = new Map()
  const EF = new Map()
  const inProgress = new Set()
  function forward(id) {
    if (EF.has(id)) return EF.get(id)
    if (inProgress.has(id)) return 0 // cycle guard
    inProgress.add(id)
    const t = byId.get(id)
    let es = 0
    for (const dep of t.dependencies || []) {
      if (byId.has(dep)) es = Math.max(es, forward(dep))
    }
    const ef = es + dur(t)
    ES.set(id, es)
    EF.set(id, ef)
    inProgress.delete(id)
    return ef
  }
  real.forEach((t) => forward(t.id))

  const projectFinish = Math.max(0, ...real.map((t) => EF.get(t.id) || 0))

  // Backward pass — latest start/finish.
  const LF = new Map()
  const LS = new Map()
  const inProgressB = new Set()
  function backward(id) {
    if (LS.has(id)) return LS.get(id)
    if (inProgressB.has(id)) return projectFinish
    inProgressB.add(id)
    const t = byId.get(id)
    const succ = successors.get(id) || []
    let lf = succ.length ? Infinity : projectFinish
    for (const s of succ) lf = Math.min(lf, backward(s))
    if (!isFinite(lf)) lf = projectFinish
    const ls = lf - dur(t)
    LF.set(id, lf)
    LS.set(id, ls)
    inProgressB.delete(id)
    return ls
  }
  real.forEach((t) => backward(t.id))

  const float = {}
  const critical = new Set()
  for (const t of real) {
    const f = (LS.get(t.id) ?? 0) - (ES.get(t.id) ?? 0)
    float[t.id] = f
    if (f <= 0) critical.add(t.id)
  }

  return { critical, float, projectFinish }
}
