import { Building2, FolderKanban, Users, Building, History, Plus, BookOpen } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { asRoleArray, roleLabel, isMasterAdmin, isCompanyManagement, hasModuleAccess, MODULES } from '../auth/roles'
import Avatar from './Avatar'

export default function Sidebar({ projects, activeProjectId, view, onSelectProject, onSetView, pendingCount, onCreateProject }) {
  const { userProfile } = useAuth()
  const canSeeSchedule = hasModuleAccess(userProfile?.role, MODULES.SCHEDULE)
  const canSeeAdminManagement = isMasterAdmin(userProfile?.role)
  const canSeeCompanyManagement = isCompanyManagement(userProfile?.role)
  const fullName = `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || userProfile?.email

  return (
    <aside className="no-print w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-slate-100">
        <div className="bg-blue-600 text-white p-1.5 rounded-lg"><Building2 size={18} /></div>
        <span className="font-bold">SmartProject</span>
      </div>

      {/* Profile card */}
      <div className="m-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
        <Avatar profile={userProfile} size={42} />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-800 truncate">{fullName}</div>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {asRoleArray(userProfile?.role).map((r) => (
              <span key={r} className="text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                {roleLabel(r)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* User Manual */}
      <div className="px-2 pb-1">
        <button
          onClick={() => onSetView('manual')}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
            view === 'manual' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <BookOpen size={16} className={view === 'manual' ? 'text-white' : 'text-slate-400'} />
          <span>User Manual</span>
        </button>
      </div>

      {/* Project Management */}
      <div className="flex-1 overflow-y-auto scroll-thin px-2">
        <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Project Management
          </p>
          {onCreateProject && (
            <button
              onClick={onCreateProject}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              title="Create project"
              aria-label="Create project"
            >
              <Plus size={15} />
            </button>
          )}
        </div>

        <nav className="space-y-0.5">
          {projects.length === 0 ? (
            <p className="px-3 py-2 text-xs text-slate-400">
              {canSeeSchedule ? 'No projects assigned yet.' : 'No projects available yet.'}
            </p>
          ) : (
            projects.map((p) => {
              const active = p.id === activeProjectId
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${
                    active ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FolderKanban size={16} className={active ? 'text-white' : 'text-slate-400'} />
                  <span className="truncate">{p.name}</span>
                </button>
              )
            })
          )}
        </nav>
      </div>

      {/* Management (MasterAdmin only) */}
      {canSeeAdminManagement && (
        <div className="border-t border-slate-100 px-2 py-2">
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Management
          </p>
          <button
            onClick={() => onSetView('users')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${
              view === 'users' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users size={16} className={view === 'users' ? 'text-white' : 'text-slate-400'} /> User Management
            {pendingCount > 0 && (
              <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSetView('companies')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${
              view === 'companies' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Building size={16} className={view === 'companies' ? 'text-white' : 'text-slate-400'} /> Companies
          </button>
          <button
            onClick={() => onSetView('activity')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${
              view === 'activity' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <History size={16} className={view === 'activity' ? 'text-white' : 'text-slate-400'} /> Activity Log
          </button>
        </div>
      )}

      {/* Company Management (CompanyManagement only) */}
      {canSeeCompanyManagement && (
        <div className="border-t border-slate-100 px-2 py-2">
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Company Management
          </p>
          <button
            onClick={() => onSetView('companyUsers')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${
              view === 'companyUsers' ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Users size={16} className={view === 'companyUsers' ? 'text-white' : 'text-slate-400'} /> Company User
          </button>
        </div>
      )}
    </aside>
  )
}
