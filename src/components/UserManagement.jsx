import { useMemo, useState } from 'react'
import { Users, Search, Check, X, Pencil, ShieldCheck, Building2, ChevronDown } from 'lucide-react'
import Modal, { Field, inputCls } from './Modal'
import Avatar from './Avatar'
import MultiSelect from './MultiSelect'
import { ROLES, DEPARTMENTS, roleLabel } from '../auth/roles'

const STATUS_STYLES = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
}

const ROLE_OPTIONS = ROLES.map((r) => ({ value: r, label: roleLabel(r) }))

export default function UserManagement({
  users,
  projects,
  companies = [],
  patchUser,
  mode = 'admin',
  scopeCompanyId = '',
  title = 'User Management',
  subtitle,
  companyFilter = '',
  onCompanyFilterChange,
}) {
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null)

  const projectOptions = useMemo(
    () => projects.map((p) => ({ value: p.id, label: p.name })),
    [projects]
  )
  const companyOptions = useMemo(
    () => companies.map((c) => ({ value: c.id, label: c.name })),
    [companies]
  )
  const companyMap = useMemo(
    () => Object.fromEntries(companies.map((c) => [c.id, c.name])),
    [companies]
  )
  const isCompanyMode = mode === 'company'
  const visibleUsers = useMemo(() => {
    if (isCompanyMode) return users.filter((u) => u.companyId === scopeCompanyId)
    return users
  }, [users, isCompanyMode, scopeCompanyId])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = visibleUsers.filter((u) => {
      if (!isCompanyMode && companyFilter && u.companyId !== companyFilter) return false
      if (!needle) return true
      return [u.firstName, u.lastName, u.email, u.position, companyMap[u.companyId] || '', (u.role || []).join(' ')]
        .join(' ').toLowerCase().includes(needle)
    })
    // pending first, then by name
    return list.sort((a, b) => {
      if ((a.status === 'pending') !== (b.status === 'pending')) return a.status === 'pending' ? -1 : 1
      return `${a.firstName}`.localeCompare(`${b.firstName}`)
    })
  }, [visibleUsers, q, companyFilter, companyMap, isCompanyMode])

  const pendingCount = visibleUsers.filter((u) => u.status === 'pending').length
  const companyName = scopeCompanyId ? companyMap[scopeCompanyId] : ''

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-4">
      <header className="flex flex-wrap items-center gap-3">
        <div className="bg-slate-800 text-white p-2 rounded-lg"><Users size={22} /></div>
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          <p className="text-sm text-slate-500">
            {subtitle || `${visibleUsers.length} users`}
            {isCompanyMode && companyName && <span className="text-blue-600 font-medium"> · {companyName}</span>}
            {pendingCount > 0 && <span className="text-amber-600 font-medium"> · {pendingCount} pending approval</span>}
          </p>
        </div>
        <div className="flex-1" />
        {!isCompanyMode && onCompanyFilterChange && (
          <div className="relative min-w-[220px]">
            <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={companyFilter}
              onChange={(e) => onCompanyFilterChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-8 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All companies</option>
              {companyOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        )}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users…"
            className="rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Position</th>
              {!isCompanyMode && <th className="px-4 py-3 font-semibold min-w-[200px]">Company</th>}
              <th className="px-4 py-3 font-semibold min-w-[200px]">Roles</th>
              <th className="px-4 py-3 font-semibold min-w-[200px]">Assigned Projects</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              {!isCompanyMode && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.email} className="align-top hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar profile={u} size={40} />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        {u.firstName} {u.lastName}
                        {u.isFirstUser && <ShieldCheck size={13} className="text-blue-500" title="Master Admin" />}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{u.position || '—'}</div>
                  <div className="text-xs text-slate-400">{u.department || ''}</div>
                </td>
                {!isCompanyMode && (
                  <td className="px-4 py-3">
                    <select
                      value={u.companyId || ''}
                      onChange={(e) => patchUser(u.email, { companyId: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {companyOptions.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </td>
                )}
                <td className="px-4 py-3">
                  {isCompanyMode ? (
                    <div className="text-slate-600">{(u.role || []).map(roleLabel).join(', ') || '—'}</div>
                  ) : (
                    <MultiSelect
                      options={ROLE_OPTIONS}
                      value={u.role || []}
                      onChange={(roles) => patchUser(u.email, { role: roles.length ? roles : ['User'] })}
                      placeholder="No roles"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  <MultiSelect
                    options={projectOptions}
                    value={u.assignedProjects || []}
                    onChange={(ids) => patchUser(u.email, { assignedProjects: ids })}
                    placeholder="No projects"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[u.status] || 'bg-slate-100 text-slate-600'}`}>
                    {u.status}
                  </span>
                </td>
                {!isCompanyMode && (
                  <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {u.status !== 'approved' && (
                      <button
                        onClick={() => patchUser(u.email, { status: 'approved' })}
                        title="Approve"
                        className="p-1.5 rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                      >
                        <Check size={15} />
                      </button>
                    )}
                    {u.status !== 'rejected' && (
                      <button
                        onClick={() => patchUser(u.email, { status: 'rejected' })}
                        title="Reject"
                        className="p-1.5 rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                      >
                        <X size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => setEditing(u)}
                      title="Edit details"
                      className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-600"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={isCompanyMode ? 5 : 7} className="px-4 py-10 text-center text-slate-400">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!isCompanyMode && editing && (
        <AdminUserModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => { patchUser(editing.email, patch); setEditing(null) }}
        />
      )}
    </div>
  )
}

function AdminUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    position: user.position || '',
    department: user.department || '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <Modal
      title="Edit User"
      subtitle={user.email}
      icon={Pencil}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700">Save Changes</button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar profile={user} size={48} />
          <div className="text-sm text-slate-500">
            Roles: {(user.role || []).map(roleLabel).join(', ') || '—'}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name"><input className={inputCls} value={form.firstName} onChange={set('firstName')} /></Field>
          <Field label="Last Name"><input className={inputCls} value={form.lastName} onChange={set('lastName')} /></Field>
        </div>
        <Field label="Position"><input className={inputCls} value={form.position} onChange={set('position')} /></Field>
        <Field label="Department">
          <select className={inputCls} value={form.department} onChange={set('department')}>
            <option value="">—</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
      </div>
    </Modal>
  )
}
