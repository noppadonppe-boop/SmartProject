import { useState } from 'react'
import { Building2, FolderKanban, Users, Building, History, Plus, BookOpen, Trash2, Copy } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { asRoleArray, roleLabel, isMasterAdmin, isCompanyManagement, hasModuleAccess, MODULES } from '../auth/roles'
import Avatar from './Avatar'
import { showPrompt, showAlert } from './GlobalDialog'

export default function Sidebar({ projects, activeProjectId, view, onSelectProject, onSetView, pendingCount, onCreateProject, mobileOpen, onCloseMobile, companyName, onDeleteProject, onDuplicateProject }) {
  const [isHovered, setIsHovered] = useState(false)
  const { userProfile } = useAuth()
  const canSeeSchedule = hasModuleAccess(userProfile?.role, MODULES.SCHEDULE)
  const canSeeAdminManagement = isMasterAdmin(userProfile?.role)
  const canSeeCompanyManagement = isCompanyManagement(userProfile?.role)
  const fullName = `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || userProfile?.email

  const isOpen = isHovered || mobileOpen
  const expanded = true // Always render full content, as it's hidden off-screen when closed

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={`no-print fixed inset-0 bg-slate-900/20 z-[40] transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onCloseMobile} 
      />

      {/* Edge hover trigger for desktop */}
      <div 
        className="no-print hidden md:block fixed left-0 top-0 h-screen w-2 z-[45]" 
        onMouseEnter={() => setIsHovered(true)}
      />

      {/* Placeholder to push content */}
      <div className={`no-print hidden md:block shrink-0 relative z-40 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'}`}></div>

      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          if (onCloseMobile) onCloseMobile()
        }}
        className={`no-print fixed left-0 top-0 h-screen w-64 bg-[#f4f7f9] border-r border-slate-200/60 flex flex-col transition-transform duration-300 shadow-xl z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className={`flex items-center gap-3 px-4 h-12 shrink-0 ${expanded ? '' : 'justify-center'}`}>
          <Building2 size={24} className="text-brand-600 shrink-0" />
          {expanded && <span className="font-display font-bold text-[0.9rem] text-brand-900 tracking-tight whitespace-nowrap">SmartProject</span>}
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-thin flex flex-col pb-4">
          {/* Profile card */}
        <div className={`mx-2 my-1 p-2 rounded-xl bg-indigo-50 shadow-sm border border-indigo-200 flex ${expanded ? 'items-center text-left flex-row gap-3' : 'justify-center flex-col gap-1.5'}`}>
          <Avatar profile={userProfile} size={expanded ? 36 : 32} />
          {expanded && (
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-bold font-display text-slate-800 truncate">{fullName}</div>
              <div className="flex flex-col items-start gap-1 mt-1">
                {companyName && !isMasterAdmin(userProfile?.role) && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold truncate max-w-full">
                    {companyName}
                  </span>
                )}
                <div className="flex flex-wrap gap-1">
                  {asRoleArray(userProfile?.role).map((r) => (
                    <span key={r} className="text-[9px] leading-none px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-800 font-medium">
                      {roleLabel(r)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Manual */}
        <div className="px-2 pb-2 mt-2">
          <button
            onClick={() => { onSetView('manual'); onCloseMobile?.(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              view === 'manual' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
            } ${expanded ? '' : 'justify-center'}`}
            title={!expanded ? "User Manual" : ""}
          >
            <BookOpen size={18} className={`shrink-0 ${view === 'manual' ? 'text-blue-600' : 'text-teal-500'}`} />
            {expanded && <span className="whitespace-nowrap">User Manual</span>}
          </button>
        </div>

        {/* Project Management */}
        <div className="px-2 shrink-0">
          <div className={`flex items-center gap-2 pt-4 pb-2 ${expanded ? 'justify-between px-2' : 'justify-center'}`}>
            {expanded ? (
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                Project Management
              </p>
            ) : (
              <div className="w-4 border-t border-slate-300"></div>
            )}
            {onCreateProject && expanded && (
              <button
                onClick={() => { onCreateProject(); onCloseMobile?.(); }}
                className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-brand-100 hover:text-brand-600 text-slate-400 transition-colors"
                title="Create project"
              >
                <Plus size={14} className="text-emerald-500 shrink-0" />
              </button>
            )}
          </div>

          <nav className="flex flex-col gap-0.5">
            {projects.length === 0 ? (
              expanded && (
                <p className="px-2 py-2 text-xs text-slate-400 whitespace-nowrap">
                  {canSeeSchedule ? 'No projects assigned yet.' : 'No projects available yet.'}
                </p>
              )
            ) : (
              projects.map((p) => {
                const active = p.id === activeProjectId && view === 'schedule'
                return (
                  <div
                    key={p.id}
                    className={`group w-full flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                      active ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    } ${expanded ? '' : 'justify-center'}`}
                    title={!expanded ? p.name : ""}
                    onClick={() => { onSelectProject(p.id); onCloseMobile?.(); }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FolderKanban size={16} className={`shrink-0 ${active ? 'text-white' : 'text-sky-500'}`} />
                      {expanded && <span className="truncate whitespace-nowrap">{p.name}</span>}
                    </div>
                    {expanded && (onDeleteProject || onDuplicateProject) && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {onDuplicateProject && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              const newName = await showPrompt(`Duplicate project "${p.name}". Enter new name:`, `${p.name} (Copy)`)
                              if (newName) {
                                onDuplicateProject(p.id, newName)
                              }
                            }}
                            className={`p-1 rounded shrink-0 ${active ? 'hover:bg-blue-700 text-blue-200 hover:text-white' : 'hover:bg-slate-200 text-slate-400 hover:text-blue-600'}`}
                            title="Duplicate Project"
                          >
                            <Copy size={13} />
                          </button>
                        )}
                        {onDeleteProject && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              const code = Math.floor(100000 + Math.random() * 900000)
                              const input = await showPrompt(`To delete project "${p.name}", please enter this 6-digit code: ${code}`)
                              if (input === String(code)) {
                                onDeleteProject(p.id)
                              } else if (input !== null) {
                                await showAlert('Incorrect code. Deletion cancelled.', 'Error', 'error')
                              }
                            }}
                            className={`p-1 rounded shrink-0 ${active ? 'hover:bg-blue-700 text-blue-200 hover:text-white' : 'hover:bg-slate-200 text-slate-400 hover:text-red-600'}`}
                            title="Delete Project"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </nav>
        </div>

        {/* Bottom Section Wrapper */}
        <div className="mt-auto shrink-0 flex flex-col">
          {/* Company Management (MasterAdmin & CompanyManagement) */}
          {(canSeeAdminManagement || canSeeCompanyManagement) && (
            <div className="shrink-0 border-t border-slate-200/50 px-2 py-4">
              {expanded ? (
                <p className="px-2 pb-2 text-[8px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                  Company Management
                </p>
              ) : (
                <div className="flex justify-center pb-2"><div className="w-4 border-t border-slate-300"></div></div>
              )}
              <button
                onClick={() => { onSetView('companyUsers'); onCloseMobile?.(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-medium text-left transition-colors ${
                  view === 'companyUsers' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                } ${expanded ? '' : 'justify-center'}`}
                title={!expanded ? "Company User" : ""}
              >
                <Users size={18} className={`shrink-0 ${view === 'companyUsers' ? 'text-blue-600' : 'text-indigo-500'}`} /> 
                {expanded && <span className="whitespace-nowrap">Company User</span>}
              </button>
            </div>
          )}

          {/* Management (MasterAdmin only) */}
          {canSeeAdminManagement && (
            <div className="shrink-0 border-t border-slate-200/50 px-2 pt-4">
              {expanded ? (
                <p className="px-2 pb-2 text-[8px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                  Management
                </p>
              ) : (
                <div className="flex justify-center pb-2"><div className="w-4 border-t border-slate-300"></div></div>
              )}
              <div className="space-y-1">
                <button
                  onClick={() => { onSetView('users'); onCloseMobile?.(); }}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-medium text-left transition-colors ${
                    view === 'users' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  } ${expanded ? '' : 'justify-center'}`}
                  title={!expanded ? "User Management" : ""}
                >
                  <Users size={18} className={`shrink-0 ${view === 'users' ? 'text-blue-600' : 'text-violet-500'}`} /> 
                  {expanded && <span className="whitespace-nowrap">User Management</span>}
                  {expanded && pendingCount > 0 && (
                    <span className="ml-auto text-[8px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold shrink-0">
                      {pendingCount}
                    </span>
                  )}
                  {!expanded && pendingCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 border border-white"></span>
                  )}
                </button>
                <button
                  onClick={() => { onSetView('companies'); onCloseMobile?.(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-medium text-left transition-colors ${
                    view === 'companies' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  } ${expanded ? '' : 'justify-center'}`}
                  title={!expanded ? "Companies" : ""}
                >
                  <Building size={18} className={`shrink-0 ${view === 'companies' ? 'text-blue-600' : 'text-amber-500'}`} /> 
                  {expanded && <span className="whitespace-nowrap">Companies</span>}
                </button>
                <button
                  onClick={() => { onSetView('activity'); onCloseMobile?.(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-medium text-left transition-colors ${
                    view === 'activity' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  } ${expanded ? '' : 'justify-center'}`}
                  title={!expanded ? "Activity Log" : ""}
                >
                  <History size={18} className={`shrink-0 ${view === 'activity' ? 'text-blue-600' : 'text-rose-500'}`} /> 
                  {expanded && <span className="whitespace-nowrap">Activity Log</span>}
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </aside>
    </>
  )
}
