import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
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

export default function AppShell() {
  const { user, userProfile } = useAuth()
  const data = useProjectData(user, userProfile)
  const companyScopeId = isCompanyManagement(userProfile?.role)
    ? (userProfile?.companyId || null)
    : ''
  const { users, pendingCount, patchUser } = useUsers(companyScopeId)
  const { companies, upsert: upsertCompany, remove: removeCompany } = useCompanies()
  const isAdmin = isMasterAdmin(userProfile?.role)
  const isCompanyManager = isCompanyManagement(userProfile?.role)
  const canSeeSchedule = hasModuleAccess(userProfile?.role, MODULES.SCHEDULE)
  const [view, setView] = useState(() => {
    if (isAdmin && canSeeSchedule) return 'schedule'
    if (isCompanyManager) return 'companyUsers'
    return 'schedule'
  })
  const [projectModal, setProjectModal] = useState(null)

  // Keep the active view inside the set that the current role can access.
  useEffect(() => {
    const allowedViews = new Set(['schedule'])
    if (isCompanyManager) allowedViews.add('companyUsers')
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
    <div className="flex min-h-screen">
      <Sidebar
        projects={data.projects}
        activeProjectId={data.activeProjectId}
        view={view}
        onSelectProject={selectProject}
        onSetView={setView}
        pendingCount={pendingCount}
        onCreateProject={openProjectCreator}
      />

      <main className="flex-1 min-w-0">
        <div className="no-print sticky top-0 z-30 h-14 bg-white/85 backdrop-blur border-b border-slate-200 flex items-center justify-end px-4">
          <ProfileMenu />
        </div>

        {view === 'companyUsers' && (isCompanyManager || isAdmin) && (
          <UserManagement
            users={users}
            projects={data.projects}
            companies={companies}
            patchUser={patchUser}
            mode="company"
            scopeCompanyId={isAdmin ? '' : (userProfile?.companyId || '')}
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
            />
          )
        )}
      </main>

      {projectModal && (
        <ProjectModal
          project={null}
          defaultCompanyId={projectModal.defaultCompanyId}
          currentCompanyId={data.activeProject?.companyId || userProfile?.companyId || ''}
          companies={companies}
          allowCompanyChange={isAdmin}
          onClose={() => setProjectModal(null)}
          onSave={async (form) => {
            await data.upsertProject(form)
            if (canSeeSchedule) setView('schedule')
          }}
        />
      )}
    </div>
  )
}
