// Mock data modeled on the reference Engineering/Construction Master Schedule
// (50 MW Power Plant). Used while VITE_USE_FIREBASE !== "true".
//
// Timeline: 24 months. Project start = 2025-01-01 (M1) .. 2026-12 (M24).
// Dates are ISO strings so they map cleanly onto a Firestore Timestamp later.

export const PROJECT_START = '2025-01-01'
export const TOTAL_MONTHS = 24

// Return ISO date for the START of month M (1-based) relative to PROJECT_START.
export function monthStart(m) {
  const d = new Date(PROJECT_START)
  d.setMonth(d.getMonth() + (m - 1))
  return d.toISOString().slice(0, 10)
}

// Return ISO date for the END of month M (1-based) — last day of that month.
export function monthEnd(m) {
  const d = new Date(PROJECT_START)
  d.setMonth(d.getMonth() + m, 0) // day 0 of next month = last day of month m
  return d.toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------
// PROJECTS
// ---------------------------------------------------------------------------
export const mockProjects = [
  {
    id: 'prj-001',
    companyId: 'co-1',
    name: 'Schedule for Site Construction of 50 MW Power Plant',
    owner: 'Engineering & Procurement Dept.',
    description:
      'EPC master schedule covering engineering, procurement, local civil ' +
      'construction, mechanical/electrical installation and commissioning of ' +
      'a 50 MW thermal power plant. Schedule starts with site construction, ' +
      'landscape preparation and civil work.',
    startDate: monthStart(1),
    endDate: monthEnd(24),
    attachments: [
      { name: 'Master_Schedule_Rev_C.pdf', url: '#' },
      { name: 'Site_Layout_50MW.dwg', url: '#' },
    ],
  },
  {
    id: 'prj-002',
    companyId: 'co-2',
    name: 'Wastewater Treatment Plant Upgrade',
    owner: 'Civil & Infrastructure Team',
    description:
      'Design and construction upgrade of a municipal wastewater treatment ' +
      'plant: new clarifiers, aeration basins, pumping station and SCADA.',
    startDate: monthStart(1),
    endDate: monthEnd(12),
    attachments: [{ name: 'WWTP_Process_Flow.pdf', url: '#' }],
  },
]

// ---------------------------------------------------------------------------
// TASKS
// group: used only for bar coloring/category in the UI.
//   'header' | 'eng' | 'civil' | 'equip' | 'commission'
// span: [startMonth, endMonth] convenience for the gantt; also reflected in
//   planStartDate / planEndDate. actualSpan -> actual* dates.
// ---------------------------------------------------------------------------
function task(o) {
  const [ps, pe] = o.span || [0, 0]
  const [as, ae] = o.actualSpan || [0, 0]
  return {
    id: o.id,
    projectId: o.projectId || 'prj-001',
    wbsCode: o.wbsCode,
    taskName: o.taskName,
    group: o.group || 'civil',
    isHeader: o.group === 'header',
    weight: o.weight ?? 0,
    planStartDate: ps ? monthStart(ps) : null,
    planEndDate: pe ? monthEnd(pe) : null,
    actualStartDate: as ? monthStart(as) : null,
    actualEndDate: ae ? monthEnd(ae) : null,
    planProgress: o.planProgress ?? 0,
    actualProgress: o.actualProgress ?? 0,
    dependencies: o.dependencies || [],
    milestone: o.milestone || false,
    resource: o.resource || '',
    taskNote: o.taskNote || '',
  }
}

export const mockTasks = [
  // 1. ENGINEERING PROCUREMENT AND CONSTRUCTION COMMISSIONING WORK
  task({ id: 't-1', wbsCode: '1', taskName: 'ENGINEERING PROCUREMENT AND CONSTRUCTION COMMISSIONING WORK', group: 'header' }),
  task({ id: 't-1-1', wbsCode: '1.1', taskName: 'Boiler and TG Engineering work', group: 'eng', weight: 5.0, span: [1, 6], actualSpan: [1, 6], planProgress: 100, actualProgress: 100, resource: 'TaiYuan', taskNote: 'Detailed engineering' }),
  task({ id: 't-1-2', wbsCode: '1.2', taskName: 'Delivery of Boiler and TG with accessories and auxiliary equipment from TaiYuan', group: 'eng', weight: 11.0, span: [5, 16], actualSpan: [5, 15], planProgress: 100, actualProgress: 95, resource: 'TaiYuan', taskNote: 'Long-lead delivery', dependencies: ['t-1-1'] }),

  // 2. LOCAL WORK CONSTRUCTION
  task({ id: 't-2', wbsCode: '2', taskName: 'LOCAL WORK CONSTRUCTION', group: 'header' }),
  task({ id: 't-2-1', wbsCode: '2.1', taskName: 'Civil work Boiler, TG, All Building, Drain Pit, Pond, Access road, Storage yard', group: 'civil', weight: 16.0, span: [1, 13], actualSpan: [1, 13], planProgress: 100, actualProgress: 100, taskNote: 'Load data from TY' }),
  task({ id: 't-2-2', wbsCode: '2.2', taskName: 'Fuel storage house and stock yard', group: 'civil', weight: 6.0, span: [9, 14], actualSpan: [9, 14], planProgress: 100, actualProgress: 100 }),
  task({ id: 't-2-3', wbsCode: '2.3', taskName: 'Fuel conveyor system', group: 'civil', weight: 6.0, span: [10, 15], actualSpan: [10, 14], planProgress: 100, actualProgress: 80 }),
  task({ id: 't-2-4', wbsCode: '2.4', taskName: 'Boiler Island (Boiler, Refractory, Insulation, Pump, Fan, ESP, Stack, Internal piping)', group: 'civil', weight: 11.95, span: [9, 20], actualSpan: [9, 18], planProgress: 100, actualProgress: 75, dependencies: ['t-2-1'] }),
  task({ id: 't-2-5', wbsCode: '2.5', taskName: 'NDE work for boiler and piping (High pressure, High temperature)', group: 'civil', weight: 7.75, span: [14, 20], actualSpan: [14, 18], planProgress: 90, actualProgress: 60 }),
  task({ id: 't-2-6', wbsCode: '2.6', taskName: 'Heat treatment', group: 'civil', weight: 7.0, span: [15, 21], actualSpan: [0, 0], planProgress: 70, actualProgress: 0 }),
  task({ id: 't-2-7', wbsCode: '2.7', taskName: 'LO and High pressure piping (Boiler - Turbine and Utility piping)', group: 'civil', weight: 8.0, span: [13, 20], actualSpan: [13, 17], planProgress: 85, actualProgress: 55 }),
  task({ id: 't-2-8', wbsCode: '2.8', taskName: 'Ash conveyor system', group: 'civil', weight: 11.0, span: [11, 21], actualSpan: [11, 18], planProgress: 80, actualProgress: 50, taskNote: 'Local purchase' }),
  task({ id: 't-2-9', wbsCode: '2.9', taskName: 'Waste water treatment system', group: 'civil', weight: 9.0, span: [12, 20], actualSpan: [12, 17], planProgress: 80, actualProgress: 45, taskNote: 'Local purchase' }),
  task({ id: 't-2-10', wbsCode: '2.10', taskName: 'Turbine House (Turbine, Generator, Condenser, Oil cooling Unit, Piping)', group: 'civil', weight: 10.0, span: [13, 22], actualSpan: [13, 18], planProgress: 70, actualProgress: 40, taskNote: 'Install' }),
  task({ id: 't-2-11', wbsCode: '2.11', taskName: 'Water treatment plant (DI system)', group: 'civil', weight: 11.75, span: [12, 22], actualSpan: [12, 18], planProgress: 70, actualProgress: 40 }),
  task({ id: 't-2-12', wbsCode: '2.12', taskName: 'Cooling Tower include piping to TG', group: 'civil', weight: 12.0, span: [13, 23], actualSpan: [13, 18], planProgress: 65, actualProgress: 35, taskNote: 'Install' }),
  task({ id: 't-2-13', wbsCode: '2.13', taskName: 'Boiler and TG Control instrument work', group: 'civil', weight: 11.0, span: [14, 23], actualSpan: [14, 18], planProgress: 60, actualProgress: 30, taskNote: 'Install' }),
  task({ id: 't-2-14', wbsCode: '2.14', taskName: 'Fire fighting system', group: 'civil', weight: 10.0, span: [11, 20], actualSpan: [11, 17], planProgress: 60, actualProgress: 35, taskNote: 'Local purchase' }),
  task({ id: 't-2-15', wbsCode: '2.15', taskName: 'Sub station', group: 'civil', weight: 10.0, span: [11, 20], actualSpan: [11, 17], planProgress: 60, actualProgress: 35, taskNote: 'Install' }),
  task({ id: 't-2-16', wbsCode: '2.16', taskName: 'Test run and commissioning', group: 'commission', weight: 6.0, span: [19, 24], actualSpan: [0, 0], planProgress: 20, actualProgress: 0, milestone: true, taskNote: 'A / B / C stage commissioning', dependencies: ['t-2-13', 't-2-4'] }),

  // 3. CONSUMABLE COST
  task({ id: 't-3', wbsCode: '3', taskName: 'CONSUMABLE COST', group: 'header' }),

  // 4. EQUIPMENT FOR INSTALLATION
  task({ id: 't-4', wbsCode: '4', taskName: 'EQUIPMENT FOR INSTALLATION', group: 'header' }),
  task({ id: 't-4-1', wbsCode: '4.1', taskName: 'Heavy lift for boiler pressure part and steel structure', group: 'equip', weight: 4.0, span: [9, 12], actualSpan: [9, 12], planProgress: 100, actualProgress: 100 }),
  task({ id: 't-4-2', wbsCode: '4.2', taskName: 'For load and unload material', group: 'equip', weight: 19.75, span: [6, 24], actualSpan: [6, 18], planProgress: 70, actualProgress: 55 }),
  task({ id: 't-4-3', wbsCode: '4.3', taskName: 'Site transport', group: 'equip', weight: 21.0, span: [5, 24], actualSpan: [5, 18], planProgress: 70, actualProgress: 55 }),
  task({ id: 't-4-4', wbsCode: '4.4', taskName: 'Civil equipment', group: 'equip', weight: 15.0, span: [6, 20], actualSpan: [6, 18], planProgress: 80, actualProgress: 70 }),

  // ---- Project 2: Wastewater Treatment Plant Upgrade (12 months) ----
  task({ id: 'w-1', projectId: 'prj-002', wbsCode: '1', taskName: 'DESIGN & PROCUREMENT', group: 'header' }),
  task({ id: 'w-1-1', projectId: 'prj-002', wbsCode: '1.1', taskName: 'Process & detailed design', group: 'eng', weight: 12.0, span: [1, 3], actualSpan: [1, 3], planProgress: 100, actualProgress: 100 }),
  task({ id: 'w-1-2', projectId: 'prj-002', wbsCode: '1.2', taskName: 'Equipment procurement (pumps, blowers, SCADA)', group: 'eng', weight: 14.0, span: [2, 6], actualSpan: [2, 5], planProgress: 100, actualProgress: 85, dependencies: ['w-1-1'] }),
  task({ id: 'w-2', projectId: 'prj-002', wbsCode: '2', taskName: 'CIVIL CONSTRUCTION', group: 'header' }),
  task({ id: 'w-2-1', projectId: 'prj-002', wbsCode: '2.1', taskName: 'Site preparation & earthworks', group: 'civil', weight: 8.0, span: [3, 5], actualSpan: [3, 5], planProgress: 100, actualProgress: 100, dependencies: ['w-1-1'] }),
  task({ id: 'w-2-2', projectId: 'prj-002', wbsCode: '2.2', taskName: 'Clarifier & aeration basin construction', group: 'civil', weight: 20.0, span: [4, 9], actualSpan: [4, 8], planProgress: 90, actualProgress: 60, dependencies: ['w-2-1'] }),
  task({ id: 'w-2-3', projectId: 'prj-002', wbsCode: '2.3', taskName: 'Pumping station construction', group: 'civil', weight: 14.0, span: [5, 9], actualSpan: [5, 8], planProgress: 80, actualProgress: 50 }),
  task({ id: 'w-3', projectId: 'prj-002', wbsCode: '3', taskName: 'INSTALLATION & COMMISSIONING', group: 'header' }),
  task({ id: 'w-3-1', projectId: 'prj-002', wbsCode: '3.1', taskName: 'Mechanical & electrical installation', group: 'equip', weight: 18.0, span: [7, 11], actualSpan: [7, 9], planProgress: 60, actualProgress: 35, dependencies: ['w-1-2', 'w-2-2'] }),
  task({ id: 'w-3-2', projectId: 'prj-002', wbsCode: '3.2', taskName: 'Commissioning & handover', group: 'commission', weight: 14.0, span: [11, 12], actualSpan: [0, 0], planProgress: 0, actualProgress: 0, milestone: true, dependencies: ['w-3-1'] }),
]

// ---------------------------------------------------------------------------
// S-CURVE DATA — cumulative planned vs actual % per month (matches the
// reference chart along the bottom of the master schedule).
// Actual is only reported up to the current data date (month 13 in the ref).
// ---------------------------------------------------------------------------
export const DATA_DATE_MONTH = 13

const plannedCumulative = [
  0.4, 0.8, 1.6, 3.6, 5.6, 8.4, 11.9, 15.5, 19.5, 23.5, 28.7, 34.6,
  40.6, 48.2, 54.9, 62.9, 70.1, 76.8, 83.6, 90.0, 93.8, 96.4, 98.6, 100.0,
]

// Actual trails the plan slightly (reported through DATA_DATE_MONTH).
const actualCumulative = [
  0.3, 0.7, 1.4, 3.1, 5.0, 7.6, 10.8, 14.0, 17.8, 21.5, 26.4, 31.9, 37.5,
]

export const sCurveData = plannedCumulative.map((planned, i) => {
  const m = i + 1
  return {
    month: `M${m}`,
    monthIndex: m,
    planned,
    actual: m <= DATA_DATE_MONTH ? actualCumulative[i] : null,
  }
})
