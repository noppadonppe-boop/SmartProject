import { useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Menu } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { useProjectData } from '../hooks/useProjectData'
import { useUsers } from '../hooks/useUsers'
import { useCompanies } from '../hooks/useCompanies'
import { hasModuleAccess, isMasterAdmin, isCompanyManagement, MODULES } from '../auth/roles'
import Sidebar from './Sidebar'
import ProfileMenu from './ProfileMenu'
import Dashboard from './Dashboard'
import UserManagement from './UserManagement'
import CompanyManagement from './CompanyManagement'
import ActivityLog from './ActivityLog'
import UserManual from './UserManual'
import ProjectModal from './ProjectModal'
import TaskModal from './TaskModal'

export default function AppShell() {
  const { user, userProfile } = useAuth()
  const isAdmin = isMasterAdmin(userProfile?.role)
  const isCompanyManager = isCompanyManagement(userProfile?.role)
  
  const [headerCompanyId, setHeaderCompanyId] = useState('')
  
  const data = useProjectData(user, userProfile, headerCompanyId)
  const companyScopeId = isCompanyManager 
    ? (userProfile?.companyId || null)
    : (isAdmin ? headerCompanyId : '')
    
  const { users, pendingCount, patchUser } = useUsers(companyScopeId)
  const { companies, upsert: upsertCompany, remove: removeCompany } = useCompanies()
  const canSeeSchedule = hasModuleAccess(userProfile?.role, MODULES.SCHEDULE)
  const [view, setView] = useState(() => {
    if (isAdmin && canSeeSchedule) return 'schedule'
    if (isCompanyManager) return 'companyUsers'
    return 'schedule'
  })
  const [projectModal, setProjectModal] = useState(null)
  const [taskModal, setTaskModal] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Keep the active view inside the set that the current role can access.
  useEffect(() => {
    const allowedViews = new Set(['schedule'])
    if (isCompanyManager || isAdmin) allowedViews.add('companyUsers')
    allowedViews.add('manual')
    if (isAdmin) {
      allowedViews.add('users')
      allowedViews.add('companies')
      allowedViews.add('activity')
    }
    if (!allowedViews.has(view)) {
      if (isCompanyManager) setView('companyUsers')
      else setView('schedule')
    }
  }, [isAdmin, isCompanyManager, canSeeSchedule, view])

  const openProjectCreator = () => {
    setProjectModal({
      defaultCompanyId: data.activeProject?.companyId || userProfile?.companyId || '',
    })
  }

  const selectProject = (id) => {
    data.setActiveProjectId(id)
    if (canSeeSchedule || isCompanyManager) setView('schedule')
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7f9] font-sans">
      <Sidebar
        projects={data.projects}
        activeProjectId={data.activeProjectId}
        view={view}
        onSelectProject={selectProject}
        onSetView={setView}
        pendingCount={pendingCount}
        onCreateProject={openProjectCreator}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        companyName={companies?.find(c => c.id === userProfile?.companyId)?.name || ''}
        onDeleteProject={isAdmin || isCompanyManager ? data.deleteProject : undefined}
        onDuplicateProject={data.duplicateProject}
      />

      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="no-print shrink-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-3 md:px-6 z-30 shadow-sm">
          <div className="flex items-center gap-2 md:gap-6 min-w-0">
            <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg shrink-0" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="flex items-center min-w-0 pr-2">
              <h1 className="text-[15px] md:text-xl font-bold font-display text-brand-900 truncate">
                {view === 'schedule' && data.activeProject ? data.activeProject.name : (
                  view === 'companyUsers' ? 'Company User' : 
                  view === 'users' ? 'User Management' :
                  view === 'companies' ? 'Companies' :
                  view === 'activity' ? 'Activity Log' :
                  view === 'manual' ? 'User Manual' : 'SmartProject'
                )}
              </h1>
            </div>
            {view === 'schedule' && canSeeSchedule && data.activeProject && (
              <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
                <button
                  onClick={() => setProjectModal({ project: data.activeProject })}
                  className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 text-[11px] md:text-sm font-medium rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-brand-600 transition-colors shadow-sm whitespace-nowrap"
                >
                  <Pencil size={14} className="md:w-4 md:h-4" /> <span className="hidden sm:inline">Edit Project</span><span className="sm:hidden">Edit</span>
                </button>
                <button
                  onClick={() => setTaskModal({})}
                  className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-4 md:py-2 text-[11px] md:text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/30 whitespace-nowrap"
                >
                  <Plus size={16} className="md:w-[18px] md:h-[18px]" /> <span className="hidden sm:inline">Add Task</span><span className="sm:hidden">Task</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0 pl-2">
            {isAdmin && (
              <select
                value={headerCompanyId}
                onChange={(e) => setHeaderCompanyId(e.target.value)}
                className="text-[11px] md:text-sm border border-slate-300 rounded-lg px-2 md:px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white/80 shadow-sm max-w-[120px] md:max-w-[200px]"
              >
                <option value="">All Companies</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <ProfileMenu />
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-thin">

        {view === 'companyUsers' && (isCompanyManager || isAdmin) && (
          <UserManagement
            users={users}
            projects={data.projects}
            companies={companies}
            patchUser={patchUser}
            mode="company"
            scopeCompanyId={isAdmin ? headerCompanyId : (userProfile?.companyId || '')}
            title="Company User"
            subtitle={isAdmin ? 'Manage all users from Company Management' : 'Manage users assigned to your company'}
          />
        )}
        {view === 'users' && isAdmin && (
          <UserManagement users={users} projects={data.projects} companies={companies} patchUser={patchUser} />
        )}
        {view === 'companies' && isAdmin && (
          <CompanyManagement
            companies={companies}
            users={users}
            upsertCompany={upsertCompany}
            removeCompany={removeCompany}
          />
        )}
        {view === 'activity' && isAdmin && <ActivityLog />}
        {view === 'manual' && <UserManual userProfile={userProfile} />}
        {view === 'schedule' && canSeeSchedule && (
          data.loading || !data.activeProject ? (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
              {data.loading ? (
                <><Loader2 className="animate-spin mr-2" /> Loading project…</>
              ) : (
                <div className="text-center">
                  <p className="font-medium">No project selected</p>
                  <p className="text-sm text-slate-400">Pick a project from the sidebar, or ask an admin to assign one.</p>
                </div>
              )}
            </div>
          ) : (
            <Dashboard
              data={data}
              companies={companies}
              currentCompanyId={data.activeProject?.companyId || userProfile?.companyId || companies[0]?.id || ''}
              allowProjectCompanyChange={isAdmin}
              onEditTask={(t) => setTaskModal({ task: t })}
            />
          )
        )}
        </div>
      </main>

      {projectModal && (
        <ProjectModal
          project={projectModal.project || null}
          defaultCompanyId={projectModal.defaultCompanyId}
          currentCompanyId={data.activeProject?.companyId || userProfile?.companyId || ''}
          companies={companies}
          allowCompanyChange={isAdmin}
          onClose={() => setProjectModal(null)}
          onDelete={isAdmin || isCompanyManager ? async (id) => {
            await data.deleteProject(id)
            if (canSeeSchedule) setView('schedule')
          } : undefined}
          onSave={async (form) => {
            await data.upsertProject(form)
            if (canSeeSchedule) setView('schedule')
          }}
        />
      )}
      {taskModal && (
        <TaskModal
          task={taskModal.task}
          onClose={() => setTaskModal(null)}
          onSave={data.upsertTask}
        />
      )}
    </div>
  )
}
