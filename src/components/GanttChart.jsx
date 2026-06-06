import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis } from 'recharts'
import { ROW_H, HEADER_H, GROUP_COLORS } from '../constants'
import { dayOffset, buildMonthBands, buildWeekBands, dateFromOffset } from '../utils/dateUtils'

const FOOTER_ROW_H = 20
const HEADER_TOP = 16
const BAR_TOP = 9
const BAR_H = 8
const BAR_CY = BAR_TOP + BAR_H / 2 // plan-bar vertical center within a row

export default function GanttChart({ tasks, projectStart, projectEnd, scale, pxPerDay, sCurve, cpm, showCritical, showBaseline, onUpdateTask }) {
  const monthBands = buildMonthBands(projectStart, projectEnd)
  const weekBands = scale === 'week' ? buildWeekBands(projectStart, projectEnd) : []
  const span = sCurve.totalDays
  const width = span * pxPerDay
  const rowsHeight = tasks.length * ROW_H

  const px = (off) => off * pxPerDay
  const rowsRef = useRef(null)

  // ---- Drag-to-reschedule -------------------------------------------------
  const [drag, setDrag] = useState(null)
  const dragRef = useRef(null)

  // ---- Dependency linking -------------------------------------------------
  const [link, setLink] = useState(null) // { sourceId, x, y }
  const linkTargetRef = useRef(null)

  // True if making `source` a predecessor of `target` would create a cycle,
  // i.e. `target` is already an ancestor (predecessor-closure) of `source`.
  const wouldCycle = (sourceId, targetId) => {
    const byId = new Map(tasks.map((t) => [t.id, t]))
    const seen = new Set()
    const stack = [sourceId]
    while (stack.length) {
      const id = stack.pop()
      if (id === targetId) return true
      if (seen.has(id)) continue
      seen.add(id)
      const deps = byId.get(id)?.dependencies || []
      stack.push(...deps)
    }
    return false
  }

  const startLink = (e, task) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = rowsRef.current?.getBoundingClientRect()
    linkTargetRef.current = null
    setLink({ sourceId: task.id, x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) })
  }

  useEffect(() => {
    if (!link) return
    const onMove = (e) => {
      const rect = rowsRef.current?.getBoundingClientRect()
      setLink((l) => (l ? { ...l, x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) } : l))
    }
    const onUp = () => {
      const source = link.sourceId
      const target = linkTargetRef.current
      linkTargetRef.current = null
      setLink(null)
      if (target && target !== source && !wouldCycle(source, target)) {
        const t = tasks.find((x) => x.id === target)
        const deps = t?.dependencies || []
        if (!deps.includes(source)) onUpdateTask?.({ dependencies: [...deps, source] }, target)
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [link, tasks, onUpdateTask])

  const removeDependency = (targetId, depId) => {
    const t = tasks.find((x) => x.id === targetId)
    if (!t) return
    onUpdateTask?.({ dependencies: (t.dependencies || []).filter((d) => d !== depId) }, targetId)
  }

  const startDrag = (e, task, mode) => {
    e.preventDefault()
    e.stopPropagation()
    const s = dayOffset(projectStart, task.planStartDate)
    const en = dayOffset(projectStart, task.planEndDate)
    if (s == null) return
    const info = { id: task.id, mode, startX: e.clientX, origStart: s, origEnd: en ?? s, previewStart: s, previewEnd: en ?? s }
    dragRef.current = info
    setDrag(info)
  }

  useEffect(() => {
    if (!drag) return
    const onMove = (e) => {
      const d = dragRef.current
      if (!d) return
      const delta = Math.round((e.clientX - d.startX) / pxPerDay)
      let ps = d.origStart
      let pe = d.origEnd
      if (d.mode === 'move') {
        ps = d.origStart + delta
        pe = d.origEnd + delta
      } else if (d.mode === 'resize-l') {
        ps = Math.min(d.origStart + delta, d.origEnd)
      } else if (d.mode === 'resize-r') {
        pe = Math.max(d.origEnd + delta, d.origStart)
      }
      const next = { ...d, previewStart: ps, previewEnd: pe }
      dragRef.current = next
      setDrag(next)
    }
    const onUp = () => {
      const d = dragRef.current
      dragRef.current = null
      setDrag(null)
      if (d && (d.previewStart !== d.origStart || d.previewEnd !== d.origEnd)) {
        onUpdateTask?.(
          {
            planStartDate: dateFromOffset(projectStart, d.previewStart),
            planEndDate: dateFromOffset(projectStart, d.previewEnd),
          },
          d.id
        )
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [drag, pxPerDay, projectStart, onUpdateTask])

  // Plan bar geometry, using live drag preview when active.
  const planGeom = (t) => {
    let s = dayOffset(projectStart, t.planStartDate)
    let e = dayOffset(projectStart, t.planEndDate)
    if (s == null) return null
    if (drag && drag.id === t.id) {
      s = drag.previewStart
      e = drag.previewEnd
    }
    const end = e == null || e < s ? s : e
    return { left: px(s), width: Math.max(px(end - s + 1), 6) }
  }
  const barGeom = (sISO, eISO) => {
    const s = dayOffset(projectStart, sISO)
    const e = dayOffset(projectStart, eISO)
    if (s == null) return null
    const end = e == null || e < s ? s : e
    return { left: px(s), width: Math.max(px(end - s + 1), 6) }
  }

  const isCritical = (id) => showCritical && cpm?.critical?.has(id)

  // Geometry map for dependency arrows (plan bars).
  const geom = {}
  tasks.forEach((t, row) => {
    if (t.isHeader) return
    const g = planGeom(t)
    if (g) geom[t.id] = { left: g.left, right: g.left + g.width, cy: row * ROW_H + BAR_CY }
  })

  const arrows = []
  tasks.forEach((t) => {
    if (!t.dependencies?.length || !geom[t.id]) return
    for (const depId of t.dependencies) {
      const a = geom[depId]
      const b = geom[t.id]
      if (a && b) {
        const crit = isCritical(depId) && isCritical(t.id)
        arrows.push({ key: `${depId}->${t.id}`, depId, targetId: t.id, x1: a.right, y1: a.cy, x2: b.left, y2: b.cy, crit })
      }
    }
  })

  const dataDateX =
    sCurve.dataDateIdx >= 0 && sCurve.rows[sCurve.dataDateIdx]
      ? px(sCurve.rows[sCurve.dataDateIdx].dayOffset + 1)
      : null

  return (
    <div style={{ width }} className="relative">
      {/* Timeline header (two tiers) */}
      <div className="sticky top-0 z-20 bg-slate-800 text-white" style={{ height: HEADER_H, width }}>
        {/* Top tier: month + calendar */}
        <div className="absolute inset-x-0 top-0 border-b border-slate-700" style={{ height: HEADER_TOP }}>
          {monthBands.map((b) => (
            <div
              key={b.index}
              className="absolute flex items-center justify-center border-r border-slate-700 text-[10px] text-slate-200 overflow-hidden whitespace-nowrap"
              style={{ left: px(b.startOffset), width: px(b.days), height: HEADER_TOP }}
            >
              {b.calendar}{scale === 'month' ? ` · ${b.label}` : ''}
            </div>
          ))}
        </div>
        {/* Bottom tier: month label (month scale) or week numbers (week scale) */}
        <div className="absolute inset-x-0" style={{ top: HEADER_TOP, height: HEADER_H - HEADER_TOP }}>
          {(scale === 'week' ? weekBands : monthBands).map((b) => (
            <div
              key={b.index}
              className="absolute flex items-center justify-center border-r border-slate-700 text-[10px] font-semibold overflow-hidden"
              style={{ left: px(b.startOffset), width: px(b.days), height: HEADER_H - HEADER_TOP }}
            >
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* Rows + bars */}
      <div ref={rowsRef} className="relative" style={{ height: rowsHeight }}>
        {/* Vertical gridlines */}
        {scale === 'week' &&
          weekBands.map((b) => (
            <div key={`w${b.index}`} className="absolute top-0 border-l border-slate-100" style={{ left: px(b.startOffset), height: rowsHeight }} />
          ))}
        {monthBands.map((b) => (
          <div key={`m${b.index}`} className="absolute top-0 border-l border-slate-200" style={{ left: px(b.startOffset), height: rowsHeight }} />
        ))}

        {tasks.map((t) => {
          const plan = !t.isHeader ? planGeom(t) : null
          const act = !t.isHeader ? barGeom(t.actualStartDate, t.actualEndDate) : null
          const base = !t.isHeader && showBaseline ? barGeom(t.baselineStartDate, t.baselineEndDate) : null
          const color = GROUP_COLORS[t.group] || '#64748b'
          const crit = isCritical(t.id)
          // Finish variance vs baseline (days). Positive = slipped later.
          let variance = null
          if (t.baselineEndDate && t.planEndDate) {
            variance = dayOffset(projectStart, t.planEndDate) - dayOffset(projectStart, t.baselineEndDate)
          }
          return (
            <div
              key={t.id}
              className={`relative border-b border-slate-100 ${t.isHeader ? 'bg-slate-100' : ''}`}
              style={{ height: ROW_H }}
              onMouseEnter={() => { if (link && !t.isHeader) linkTargetRef.current = t.id }}
            >
              {/* Baseline ghost bar */}
              {base && (
                <div
                  className="absolute rounded-sm border border-violet-400/70 bg-violet-300/30"
                  style={{ left: base.left, width: base.width, top: BAR_TOP - 3, height: 3 }}
                  title={`Baseline: ${t.baselineStartDate} → ${t.baselineEndDate}`}
                />
              )}
              {plan && !t.milestone && (
                <div
                  className="absolute rounded-sm shadow-sm group/bar cursor-move"
                  onMouseDown={(e) => startDrag(e, t, 'move')}
                  style={{
                    left: plan.left,
                    width: plan.width,
                    top: BAR_TOP,
                    height: BAR_H,
                    backgroundColor: color,
                    outline: crit ? '2px solid #dc2626' : 'none',
                    outlineOffset: crit ? '1px' : 0,
                  }}
                  title={`${t.taskName} — Plan ${t.planProgress}%${crit ? ' • CRITICAL' : ''}${variance != null ? ` • Baseline var: ${variance > 0 ? '+' : ''}${variance}d` : ''}`}
                >
                  <span
                    onMouseDown={(e) => startDrag(e, t, 'resize-l')}
                    className="absolute left-0 top-0 h-full w-1.5 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 bg-black/30 rounded-l-sm"
                  />
                  <span
                    onMouseDown={(e) => startDrag(e, t, 'resize-r')}
                    className="absolute right-0 top-0 h-full w-1.5 cursor-ew-resize opacity-0 group-hover/bar:opacity-100 bg-black/30 rounded-r-sm"
                  />
                  {/* Dependency link handle */}
                  <span
                    onMouseDown={(e) => startLink(e, t)}
                    title="Drag to another task to link (finish→start)"
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-500 cursor-crosshair opacity-0 group-hover/bar:opacity-100 hover:border-blue-600 hover:scale-110"
                  />
                </div>
              )}
              {act && t.actualStartDate && !t.milestone && (
                <div
                  className="absolute rounded-sm bar-striped"
                  style={{ left: act.left, width: act.width, top: 17, height: 6, backgroundColor: color, filter: 'brightness(0.7)' }}
                  title={`${t.taskName} — Actual ${t.actualProgress}%`}
                />
              )}
              {!t.isHeader && t.milestone && t.planStartDate && (
                <div className="absolute" style={{ left: px(dayOffset(projectStart, t.planStartDate)) - 4, top: ROW_H / 2 - 4 }}>
                  <div className="w-2 h-2 rotate-45 bg-amber-500 border border-amber-700" />
                </div>
              )}
            </div>
          )
        })}

        {/* Dependency arrows */}
        {(arrows.length > 0 || link) && (
          <svg className="absolute inset-0 z-10" style={{ pointerEvents: 'none' }} width={width} height={rowsHeight}>
            <defs>
              <marker id="dep-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#64748b" />
              </marker>
              <marker id="dep-arrow-crit" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#dc2626" />
              </marker>
            </defs>
            {arrows.map((a) => {
              const midX = a.x1 + 10
              const d = `M ${a.x1} ${a.y1} H ${midX} V ${a.y2} H ${a.x2}`
              return (
                <g key={a.key}>
                  {/* Visible arrow */}
                  <path
                    d={d}
                    fill="none"
                    stroke={a.crit ? '#dc2626' : '#64748b'}
                    strokeWidth={a.crit ? 1.8 : 1.2}
                    markerEnd={`url(#${a.crit ? 'dep-arrow-crit' : 'dep-arrow'})`}
                  />
                  {/* Wide invisible hit-area for click-to-remove */}
                  <path
                    d={d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={8}
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    onClick={() => removeDependency(a.targetId, a.depId)}
                  >
                    <title>Click to remove dependency</title>
                  </path>
                </g>
              )
            })}
            {/* Temporary link line while dragging a new dependency */}
            {link && (
              <line
                x1={geom[link.sourceId]?.right ?? link.x}
                y1={geom[link.sourceId]?.cy ?? link.y}
                x2={link.x}
                y2={link.y}
                stroke="#2563eb"
                strokeWidth={1.6}
                strokeDasharray="4 3"
              />
            )}
          </svg>
        )}

        {/* Data-date vertical line */}
        {dataDateX != null && (
          <div className="absolute top-0 border-l-2 border-dashed border-slate-900/40 z-10 pointer-events-none" style={{ left: dataDateX, height: rowsHeight }} />
        )}

        {/* S-Curve overlay (recharts), positioned on the same day-based axis */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <LineChart width={width} height={rowsHeight} data={sCurve.rows} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
            <XAxis type="number" dataKey="dayOffset" domain={[0, span - 1]} hide />
            <YAxis domain={[0, 100]} hide />
            <Line type="monotone" dataKey="planned" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 1.5 }} isAnimationActive={false} />
            <Line type="monotone" dataKey="actual" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 1.5 }} connectNulls={false} isAnimationActive={false} />
          </LineChart>
        </div>
      </div>

      {/* Monthly cumulative % table (aligned to month bands) */}
      <div className="border-t-2 border-slate-300 relative">
        <MonthValueRow bands={monthBands} rows={sCurve.rows} field="planned" px={px} className="text-plan" bg="bg-blue-50/60" />
        <MonthValueRow bands={monthBands} rows={sCurve.rows} field="actual" px={px} className="text-actual" bg="bg-red-50/60" />
      </div>
    </div>
  )
}

function MonthValueRow({ bands, rows, field, px, className, bg }) {
  return (
    <div className={`relative ${bg}`} style={{ height: FOOTER_ROW_H }}>
      {bands.map((b, i) => {
        const v = rows[i]?.[field]
        return (
          <div
            key={b.index}
            className={`absolute flex items-center justify-center border-r border-slate-200 text-[9px] tabular-nums overflow-hidden ${className}`}
            style={{ left: px(b.startOffset), width: px(b.days), height: FOOTER_ROW_H }}
          >
            {v == null ? '' : `${v}%`}
          </div>
        )
      })}
    </div>
  )
}

export { FOOTER_ROW_H }
