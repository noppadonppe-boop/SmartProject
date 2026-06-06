import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import { BarChart3, AlertTriangle } from 'lucide-react'
import { dayOffset, buildMonthBands } from '../utils/dateUtils'

const PALETTE = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777', '#65a30d', '#ea580c', '#4f46e5']

// Per-month count of concurrently active tasks, grouped by resource.
// A resource is "over-allocated" in a month when it has >1 active task.
export default function ResourceHistogram({ tasks, projectStart, projectEnd }) {
  const { data, resources, overAllocations } = useMemo(() => {
    const bands = buildMonthBands(projectStart, projectEnd)
    const real = tasks.filter((t) => !t.isHeader && t.planStartDate && t.planEndDate)

    const resourceSet = new Set()
    real.forEach((t) => resourceSet.add(t.resource?.trim() || t.group || 'Unassigned'))
    const resources = [...resourceSet]

    const overAllocations = []
    const data = bands.map((b) => {
      const bStart = b.startOffset
      const bEnd = b.startOffset + b.days - 1
      const row = { month: b.label }
      resources.forEach((r) => (row[r] = 0))
      real.forEach((t) => {
        const ts = dayOffset(projectStart, t.planStartDate)
        const te = dayOffset(projectStart, t.planEndDate)
        if (ts <= bEnd && te >= bStart) {
          const r = t.resource?.trim() || t.group || 'Unassigned'
          row[r] += 1
        }
      })
      resources.forEach((r) => {
        if (row[r] > 1) overAllocations.push({ month: b.label, resource: r, count: row[r] })
      })
      return row
    })

    return { data, resources, overAllocations }
  }, [tasks, projectStart, projectEnd])

  return (
    <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <BarChart3 size={16} className="text-emerald-600" />
        <h2 className="text-sm font-semibold">Resource Workload — concurrent tasks per month</h2>
        {overAllocations.length > 0 && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <AlertTriangle size={12} /> {overAllocations.length} over-allocation{overAllocations.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className="p-3" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} interval={0} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {resources.map((r, i) => (
              <Bar key={r} dataKey={r} stackId="a" fill={PALETTE[i % PALETTE.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {overAllocations.length > 0 && (
        <div className="px-4 pb-3 -mt-1 flex flex-wrap gap-1.5">
          {overAllocations.map((o, i) => (
            <span key={i} className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded px-2 py-0.5">
              {o.resource} · {o.month}: {o.count} tasks
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
