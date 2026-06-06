import { useEffect, useMemo, useState } from 'react'
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

// Base pixels-per-day per scale; multiplied by the zoom level.
const BASE_PX_PER_DAY = { month: 56 / 30.4, week: 28 / 7 }

function addMonths(iso, n) {
  const d = new Date(iso)
  d.setMonth(d.getMonth() + n)
  return d.toISOString().slice(0, 10)
}

export default function Dashboard({ data, companies = [], currentCompanyId = '', allowProjectCompanyChange = false }) {
  const { projects, activeProject, activeProjectId, setActiveProjectId, tasks, upsertProject, upsertTask, deleteTask, saveBaseline, undo, redo, canUndo, canRedo } = data
  const [projectModal, setProjectModal] = useState(null) // {project} edit | {} new | null
  const [taskModal, setTaskModal] = useState(null) // {task} | {} for new | null
  const [scale, setScale] = useState('month') // 'month' | 'week'
  const [zoom, setZoom] = useState(1) // 0.75 | 1 | 1.5
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
    () => computeCriticalPath(tasks, projectStart),
    [tasks, projectStart]
  )

  const lastActual = sCurve.rows[sCurve.dataDateIdx]
  const lastPlanned = lastActual?.planned ?? 0
  const lastActualVal = lastActual?.actual ?? 0
  const variance = +(lastActualVal - lastPlanned).toFixed(1)

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Top bar */}
        <header className="flex flex-wrap items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Building2 size={22} />
          </div>
          <div className="relative min-w-0">
            <div className="flex items-center gap-2">
              <FolderKanban size={16} className="text-slate-400 shrink-0" />
              <select
                value={activeProjectId || ''}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="text-lg font-bold bg-transparent outline-none cursor-pointer appearance-none pr-6 truncate max-w-[48ch]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="text-slate-400 -ml-6 pointer-events-none" />
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2 pl-6">
              <CalendarRange size={14} />
              {fmtDate(activeProject?.startDate)} – {fmtDate(activeProject?.endDate)}
              <span className="text-slate-300">|</span>
              {activeProject?.owner}
            </p>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setProjectModal({ project: activeProject })}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white hover:bg-slate-100"
          >
            <Pencil size={15} /> Edit Project
          </button>
          <button
            onClick={() => setTaskModal({})}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            <Plus size={16} /> Add Task
          </button>
        </header>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Planned Progress" value={`${lastPlanned}%`} accent="text-plan" />
          <Kpi label="Actual Progress" value={`${lastActualVal}%`} accent="text-actual" />
          <Kpi
            label="Variance"
            value={`${variance > 0 ? '+' : ''}${variance}%`}
            accent={variance < 0 ? 'text-red-600' : 'text-green-600'}
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
        <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden schedule-card">
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50">
            <FileBarChart size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold">Master Schedule — Gantt &amp; S-Curve</h2>
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
              onClick={saveBaseline}
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
          <div className="flex overflow-auto scroll-thin schedule-scroll" style={{ maxHeight: '72vh' }}>
            <WbsTable
              tasks={tasks}
              cpm={cpm}
              showCritical={showCritical}
              onEditTask={(t) => setTaskModal({ task: t })}
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

      {projectModal && (
        <ProjectModal
          project={projectModal.project}
          companies={companies}
          defaultCompanyId={activeProject?.companyId || currentCompanyId || ''}
          currentCompanyId={currentCompanyId}
          allowCompanyChange={allowProjectCompanyChange}
          onClose={() => setProjectModal(null)}
          onSave={upsertProject}
        />
      )}
      {taskModal && (
        <TaskModal
          task={taskModal.task}
          onClose={() => setTaskModal(null)}
          onSave={upsertTask}
        />
      )}
    </div>
  )
}

function Kpi({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${accent}`}>{value}</div>
    </div>
  )
}
