import { useMemo, useState } from 'react'
import { History, Search, LogIn, UserPlus, UserCheck, UserX, ShieldCheck, FolderKanban, Activity } from 'lucide-react'
import { useActivityLogs, toDate } from '../hooks/useActivityLogs'

// Visual treatment + label per action type.
const ACTION_META = {
  LOGIN: { label: 'Login', icon: LogIn, cls: 'bg-blue-100 text-blue-700' },
  REGISTER: { label: 'Register', icon: UserPlus, cls: 'bg-violet-100 text-violet-700' },
  USER_APPROVE: { label: 'User Approved', icon: UserCheck, cls: 'bg-green-100 text-green-700' },
  USER_REJECT: { label: 'User Rejected', icon: UserX, cls: 'bg-red-100 text-red-700' },
  USER_ROLE_CHANGE: { label: 'Roles Changed', icon: ShieldCheck, cls: 'bg-amber-100 text-amber-700' },
  USER_PROJECTS_CHANGE: { label: 'Projects Assigned', icon: FolderKanban, cls: 'bg-cyan-100 text-cyan-700' },
  PROJECT_CREATE: { label: 'Project Created', icon: FolderKanban, cls: 'bg-emerald-100 text-emerald-700' },
  PROJECT_UPDATE: { label: 'Project Updated', icon: FolderKanban, cls: 'bg-slate-100 text-slate-700' },
}
const metaFor = (a) => ACTION_META[a] || { label: a, icon: Activity, cls: 'bg-slate-100 text-slate-600' }

function fmtTime(at) {
  const d = toDate(at)
  if (!d) return '—'
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function detailOf(log) {
  const parts = []
  if (log.targetEmail) parts.push(log.targetEmail)
  if (log.projectName) parts.push(log.projectName)
  if (log.method) parts.push(`via ${log.method}`)
  if (log.detail) parts.push(log.detail)
  return parts.join(' · ')
}

export default function ActivityLog() {
  const { logs, loading } = useActivityLogs()
  const [q, setQ] = useState('')
  const [action, setAction] = useState('all')

  const actions = useMemo(() => ['all', ...new Set(logs.map((l) => l.action))], [logs])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return logs.filter((l) => {
      if (action !== 'all' && l.action !== action) return false
      if (!needle) return true
      return [l.action, l.email, l.targetEmail, l.projectName, l.detail, l.method]
        .filter(Boolean).join(' ').toLowerCase().includes(needle)
    })
  }, [logs, q, action])

  return (
    <div className="max-w-[1200px] mx-auto p-4 lg:p-6 space-y-4">
      <header className="flex flex-wrap items-center gap-3">
        <div className="bg-slate-800 text-white p-2 rounded-lg"><History size={22} /></div>
        <div>
          <h1 className="text-lg font-bold">Activity Log</h1>
          <p className="text-sm text-slate-500">{logs.length} recent events</p>
        </div>
        <div className="flex-1" />
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {actions.map((a) => (
            <option key={a} value={a}>{a === 'all' ? 'All actions' : metaFor(a).label}</option>
          ))}
        </select>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search activity…"
            className="rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold w-44">Time</th>
              <th className="px-4 py-3 font-semibold w-48">Action</th>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">Loading activity…</td></tr>
            )}
            {!loading && filtered.map((l) => {
              const m = metaFor(l.action)
              const Icon = m.icon
              return (
                <tr key={l.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-slate-500 tabular-nums whitespace-nowrap">{fmtTime(l.at)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${m.cls}`}>
                      <Icon size={13} /> {m.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{l.email || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{detailOf(l) || '—'}</td>
                </tr>
              )
            })}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No activity found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
