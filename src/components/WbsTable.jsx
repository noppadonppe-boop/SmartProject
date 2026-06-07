import { useState } from 'react'
import { Pencil, Trash2, Flag } from 'lucide-react'
import { ROW_H, HEADER_H, WBS_WIDTH } from '../constants'
import { FOOTER_ROW_H } from './GanttChart'
import { durationMonths } from '../utils/dateUtils'

// Inline-editable cell. Click to edit, Enter/blur commits, Esc cancels.
function InlineEdit({ value, type = 'text', onCommit, className = '', display }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)

  const start = () => {
    setVal(value)
    setEditing(true)
  }
  const commit = () => {
    setEditing(false)
    const next = type === 'number' ? Number(val) : val
    if (next !== value) onCommit(next)
  }

  if (editing) {
    return (
      <input
        autoFocus
        type={type}
        step={type === 'number' ? '0.01' : undefined}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        className={`w-full bg-white border border-blue-400 rounded px-1 outline-none ${className}`}
      />
    )
  }
  return (
    <span
      onClick={start}
      className={`cursor-text hover:bg-blue-100/60 rounded px-0.5 ${className}`}
      title="Click to edit"
    >
      {display ?? (value === '' || value == null ? '—' : value)}
    </span>
  )
}

export default function WbsTable({ tasks, cpm, showCritical, onEditTask, onDeleteTask, onUpdateTask, wbsSortDir, onToggleWbsSort }) {
  const totalWeight = tasks.reduce((sum, t) => sum + (!t.isHeader ? Number(t.weight || 0) : 0), 0)

  return (
    <div className="shrink-0 sticky left-0 z-30 border-r border-slate-300 bg-transparent backdrop-blur-sm" style={{ width: WBS_WIDTH }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center bg-slate-800 text-white text-[10px] font-semibold uppercase tracking-wide"
        style={{ height: HEADER_H }}
      >
        <div 
          className={`px-2 shrink-0 flex items-center gap-1 ${onToggleWbsSort ? 'cursor-pointer hover:text-blue-300 transition-colors' : ''}`} 
          style={{ width: 48 }}
          onClick={onToggleWbsSort}
          title="Click to sort by WBS"
        >
          WBS
          {wbsSortDir === 'asc' && <span className="text-[14px] leading-none text-blue-400">↑</span>}
          {wbsSortDir === 'desc' && <span className="text-[14px] leading-none text-blue-400">↓</span>}
        </div>
        <div className="px-2 flex-1">Task Name</div>
        <div className="px-1 text-center shrink-0 leading-tight" style={{ width: 52 }}>
          <div>Wt%</div>
          <div className="text-[8px] text-blue-300 normal-case" title="Total Weight">{totalWeight.toFixed(1)}%</div>
        </div>
        <div className="px-1 text-center shrink-0" style={{ width: 46 }} title="Total float (days)">Float</div>
        <div className="px-2 text-center shrink-0" style={{ width: 44 }}>Dur</div>
      </div>

      {/* Rows */}
      {tasks.map((t) => {
        const dur = durationMonths(t.planStartDate, t.planEndDate)
        const float = cpm?.float?.[t.id]
        const critical = showCritical && cpm?.critical?.has(t.id)
        return (
          <div
            key={t.id}
            className={`group flex items-center border-b border-slate-100 text-[11px] ${
              t.isHeader ? 'font-semibold' : 'hover:bg-blue-50/60'
            } ${critical ? 'bg-red-50/30' : ''}`}
            style={{ height: ROW_H }}
          >
            <div className="px-2 shrink-0 text-slate-500 tabular-nums text-[10px]" style={{ width: 48 }}>
              {t.wbsCode}
            </div>
            <div className="px-2 flex-1 min-w-0 flex items-center gap-1.5">
              {t.milestone && <Flag size={12} className="text-amber-500 shrink-0" />}
              <InlineEdit
                value={t.taskName}
                onCommit={(v) => onUpdateTask({ taskName: v }, t.id)}
                className={`truncate block ${t.isHeader ? 'text-slate-800 uppercase text-[10px] tracking-wide font-semibold' : ''}`}
              />
            </div>
            <div className="px-2 text-center shrink-0 tabular-nums text-[10px] text-slate-600" style={{ width: 52 }}>
              {t.isHeader ? '' : (
                <InlineEdit
                  type="number"
                  value={t.weight ?? 0}
                  onCommit={(v) => onUpdateTask({ weight: v }, t.id)}
                  display={t.weight ? t.weight.toFixed(2) : '0.00'}
                  className="text-center text-[10px]"
                />
              )}
            </div>
            <div className="px-1 text-center shrink-0 tabular-nums text-[10px]" style={{ width: 46 }}>
              {t.isHeader || float == null ? '' : (
                <span className={critical ? 'text-red-600 font-bold' : 'text-slate-400'}>{float}</span>
              )}
            </div>
            <div className="px-1 text-center shrink-0 tabular-nums text-[10px] text-slate-500 relative" style={{ width: 44 }}>
              {!t.isHeader && dur ? dur : ''}
              {!t.isHeader && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-0.5 bg-white/90 rounded px-0.5">
                  <button onClick={() => onEditTask(t)} className="p-1 text-slate-400 hover:text-blue-600">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => onDeleteTask(t.id)} className="p-1 text-slate-400 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Footer labels — aligned with Gantt cumulative % table */}
      <div className="border-t-2 border-slate-300">
        <div
          className="flex items-center justify-end px-3 bg-blue-50/60 text-plan text-[10px] font-semibold"
          style={{ height: FOOTER_ROW_H }}
        >
          Cumulative Planned %
        </div>
        <div
          className="flex items-center justify-end px-3 bg-red-50/60 text-actual text-[10px] font-semibold"
          style={{ height: FOOTER_ROW_H }}
        >
          Cumulative Actual %
        </div>
      </div>
    </div>
  )
}
