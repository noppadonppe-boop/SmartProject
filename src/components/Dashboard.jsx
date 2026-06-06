import { useEffect, useMemo, useState, useRef } from 'react'
import { Building2, Plus, Pencil, CalendarRange, FileBarChart, ChevronDown, FolderKanban, ZoomIn, ZoomOut, Download, Printer, Activity, Undo2, Redo2, Flag, BarChart3 } from 'lucide-react'
import { PROJECT_START } from '../data/mockData'
import { fmtDate } from '../utils/dateUtils'
import { computeSCurve } from '../utils/sCurve'
import { computeCriticalPath } from '../utils/criticalPath'
import { exportTasksCsv } from '../utils/exportCsv'
import { GROUP_COLORS, GROUP_LABELS } from '../constants'
import WbsTable from './WbsTable'
import GanttChart from './GanttChart'
import ResourceHistogram from './ResourceHistogram'
import ProjectModal from './ProjectModal'
import TaskModal from './TaskModal'
import { showAlert } from './GlobalDialog'

// Base pixels-per-day per scale; multiplied by the zoom level.
const BASE_PX_PER_DAY = { month: 56 / 30.4, week: 28 / 7 }

function addMonths(iso, n) {
  const d = new Date(iso)
  d.setMonth(d.getMonth() + n)
  return d.toISOString().slice(0, 10)
}

export default function Dashboard({ data, companies = [], currentCompanyId = '', allowProjectCompanyChange = false, onEditTask }) {
  const { projects, activeProject, activeProjectId, setActiveProjectId, tasks, upsertProject, upsertTask, deleteTask, saveBaseline, undo, redo, canUndo, canRedo } = data

  const [scale, setScale] = useState('month') // 'month' | 'week'
  const [zoom, setZoom] = useState(0.75) // 0.75 | 1 | 1.5
  const [showCritical, setShowCritical] = useState(true)
  const [showBaseline, setShowBaseline] = useState(false)
  const [showHistogram, setShowHistogram] = useState(false)

  // Keyboard shortcuts: Ctrl/Cmd+Z undo, Ctrl+Shift+Z or Ctrl+Y redo.
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const ctrl = e.ctrlKey || e.metaKey
      if (!ctrl) return
      const k = e.key.toLowerCase()
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((k === 'z' && e.shiftKey) || k === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  const projectStart = activeProject?.startDate || PROJECT_START
  const projectEnd = activeProject?.endDate || addMonths(projectStart, 24)
  const pxPerDay = BASE_PX_PER_DAY[scale] * zoom

  const sCurve = useMemo(
    () => computeSCurve(tasks, projectStart, projectEnd),
    [tasks, projectStart, projectEnd]
  )
  const cpm = useMemo(
    () => computeCriticalPath(tasks),
    [tasks]
  )

  // Drag-to-scroll logic
  const scrollRef = useRef(null)
  const isDown = useRef(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const scrollLeft = useRef(0)
  const scrollTop = useRef(0)

  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    if (e.target.closest('button, input, select, .cursor-ew-resize, .cursor-move, .cursor-crosshair, .cursor-text, .bar-striped')) return
    isDown.current = true
    startX.current = e.pageX - scrollRef.current.offsetLeft
    startY.current = e.pageY - scrollRef.current.offsetTop
    scrollLeft.current = scrollRef.current.scrollLeft
    scrollTop.current = scrollRef.current.scrollTop
    scrollRef.current.style.cursor = 'grabbing'
    scrollRef.current.style.userSelect = 'none'
  }

  const handleMouseLeaveOrUp = () => {
    isDown.current = false
    if (scrollRef.current) {
      scrollRef.current.style.cursor = ''
      scrollRef.current.style.userSelect = ''
    }
  }

  const handleMouseMove = (e) => {
    if (!isDown.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const y = e.pageY - scrollRef.current.offsetTop
    const walkX = (x - startX.current) * 1.5
    const walkY = (y - startY.current) * 1.5
    scrollRef.current.scrollLeft = scrollLeft.current - walkX
    scrollRef.current.scrollTop = scrollTop.current - walkY
  }

  const lastActual = sCurve.rows[sCurve.dataDateIdx]
  const lastPlanned = lastActual?.planned ?? 0
  const lastActualVal = lastActual?.actual ?? 0
  const variance = +(lastActualVal - lastPlanned).toFixed(1)

  return (
    <div className="space-y-3">
      <div className="max-w-[1600px] mx-auto space-y-3">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Actual Progress" value={`${lastActualVal}%`} accent="text-brand-600" />
          <Kpi label="Planned Progress" value={`${lastPlanned}%`} accent="text-slate-700" />
          <Kpi
            label="Variance"
            value={`${variance > 0 ? '+' : ''}${variance}%`}
            accent={variance < 0 ? 'text-red-500' : 'text-emerald-500'}
          />
          <Kpi label="Total Tasks" value={tasks.filter((t) => !t.isHeader).length} accent="text-slate-800" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
          {Object.entries(GROUP_LABELS).map(([k, label]) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className="w-4 h-3 rounded-sm" style={{ backgroundColor: GROUP_COLORS[k] }} /> {label}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-3 rounded-sm bar-striped bg-slate-500" /> Actual (striped)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 h-0.5 bg-plan" /> Planned S-Curve
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-5 h-0.5 bg-actual" /> Actual S-Curve
          </span>
        </div>

        {/* Unified Gantt + S-Curve */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden schedule-card">
          <div className="flex flex-wrap items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-white">
            <FileBarChart size={18} className="text-brand-600" />
            <h2 className="text-[15px] font-display font-bold text-slate-800">Master Schedule — Gantt &amp; S-Curve</h2>
            <div className="flex-1" />
            {/* Undo / redo */}
            <div className="no-print inline-flex items-center gap-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <Undo2 size={15} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <Redo2 size={15} />
              </button>
            </div>
            {/* Baseline */}
            <button
              onClick={async () => {
                saveBaseline()
                await showAlert('Save Set Baseline แล้ว', 'Success', 'success')
              }}
              title="Save current plan as baseline"
              className="no-print inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-100"
            >
              <Flag size={14} /> Set Baseline
            </button>
            <button
              onClick={() => setShowBaseline((v) => !v)}
              className={`no-print inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border ${showBaseline ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-300 bg-white hover:bg-slate-100'}`}
            >
              Baseline
            </button>
            <button
              onClick={() => setShowHistogram((v) => !v)}
              className={`no-print inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border ${showHistogram ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-white hover:bg-slate-100'}`}
            >
              <BarChart3 size={14} /> Resources
            </button>
            {/* Scale toggle */}
            <div className="no-print inline-flex rounded-lg border border-slate-300 overflow-hidden text-xs">
              {['month', 'week'].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`px-3 py-1.5 capitalize ${scale === s ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* Critical path toggle */}
            <button
              onClick={() => setShowCritical((v) => !v)}
              className={`no-print inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border ${showCritical ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-300 bg-white hover:bg-slate-100'}`}
            >
              <Activity size={14} /> Critical Path
            </button>
            {/* Zoom */}
            <div className="no-print inline-flex items-center gap-1">
              <button onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100">
                <ZoomOut size={15} />
              </button>
              <span className="text-xs tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100">
                <ZoomIn size={15} />
              </button>
            </div>
            <button
              onClick={() => exportTasksCsv(activeProject, tasks, sCurve)}
              className="no-print inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-100"
            >
              <Download size={14} /> CSV
            </button>
            <button
              onClick={() => window.print()}
              className="no-print inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-100"
            >
              <Printer size={14} /> Print
            </button>
          </div>
          <div 
            ref={scrollRef}
            className="flex overflow-auto scroll-thin schedule-scroll" 
            style={{ maxHeight: '72vh', cursor: 'grab' }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeaveOrUp}
            onMouseUp={handleMouseLeaveOrUp}
            onMouseMove={handleMouseMove}
          >
            <WbsTable
              tasks={tasks}
              cpm={cpm}
              showCritical={showCritical}
              onEditTask={onEditTask}
              onDeleteTask={deleteTask}
              onUpdateTask={upsertTask}
            />
            <GanttChart
              tasks={tasks}
              projectStart={projectStart}
              projectEnd={projectEnd}
              scale={scale}
              pxPerDay={pxPerDay}
              sCurve={sCurve}
              cpm={cpm}
              showCritical={showCritical}
              showBaseline={showBaseline}
              onUpdateTask={upsertTask}
            />
          </div>
        </div>

        {/* Resource workload histogram */}
        {showHistogram && (
          <ResourceHistogram tasks={tasks} projectStart={projectStart} projectEnd={projectEnd} />
        )}
      </div>
    </div>
  )
}

function Kpi({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 px-4 py-2 shadow-sm flex flex-col justify-center">
      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-display font-bold tabular-nums tracking-tight ${accent}`}>{value}</div>
    </div>
  )
}
