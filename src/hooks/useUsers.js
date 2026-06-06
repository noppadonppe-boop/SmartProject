// Realtime list of all user profiles (admin use). In mock mode returns a small
// demo roster so the User Management interface is explorable without Firebase.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { USE_FIREBASE, auth } from '../firebase'
import { subscribeUsers, updateUserProfile, logActivity } from '../services/userService'

// Map a profile patch to an activity log entry (best-effort).
function logUserPatch(targetEmail, patch) {
  const actor = auth?.currentUser?.email
  const base = { email: actor, targetEmail }
  if (patch.status === 'approved') logActivity('USER_APPROVE', base)
  else if (patch.status === 'rejected') logActivity('USER_REJECT', base)
  if (patch.role) logActivity('USER_ROLE_CHANGE', { ...base, detail: patch.role.join(', ') })
  if (patch.assignedProjects) logActivity('USER_PROJECTS_CHANGE', { ...base, detail: `${patch.assignedProjects.length} project(s)` })
  if (Object.prototype.hasOwnProperty.call(patch, 'companyId')) {
    logActivity('USER_COMPANY_CHANGE', { ...base, detail: patch.companyId || 'unassigned' })
  }
}

const MOCK_USERS = [
  {
    id: 'demo@smartproject.app', uid: 'demo', email: 'demo@smartproject.app',
    firstName: 'Demo', lastName: 'Admin', position: 'Project Director',
    department: 'Management', role: ['MasterAdmin'], status: 'approved',
    assignedProjects: [], companyId: 'co-1', photoURL: '', isFirstUser: true,
  },
  {
    id: 'somchai@example.com', uid: 'u2', email: 'somchai@example.com',
    firstName: 'Somchai', lastName: 'P.', position: 'Site Engineer',
    department: 'Engineering', role: ['CompanyManagement'], status: 'approved',
    assignedProjects: [], companyId: 'co-1', photoURL: '',
  },
  {
    id: 'malee@example.com', uid: 'u3', email: 'malee@example.com',
    firstName: 'Malee', lastName: 'S.', position: 'Planner',
    department: 'Construction', role: ['User'], status: 'pending',
    assignedProjects: [], companyId: 'co-2', photoURL: '',
  },
]

export function useUsers(companyId = '') {
  const initialUsers = useMemo(
    () => {
      if (USE_FIREBASE) return []
      if (companyId === null) return []
      return companyId ? MOCK_USERS.filter((u) => u.companyId === companyId) : MOCK_USERS
    },
    [companyId]
  )
  const [users, setUsers] = useState(initialUsers)
  const [loading, setLoading] = useState(USE_FIREBASE)

  useEffect(() => {
    if (!USE_FIREBASE) return
    if (companyId === null) {
      setUsers([])
      setLoading(false)
      return undefined
    }
    const unsub = subscribeUsers((list) => {
      setUsers(list)
      setLoading(false)
    }, { companyId })
    return () => unsub()
  }, [companyId])

  useEffect(() => {
    if (USE_FIREBASE) return
    if (companyId === null) {
      setUsers([])
      return
    }
    setUsers(companyId ? MOCK_USERS.filter((u) => u.companyId === companyId) : MOCK_USERS)
  }, [companyId])

  // Centralized mutation that works in both modes. In Firebase mode the realtime
  // subscription reflects the change; in mock mode we patch local state.
  const patchUser = useCallback(async (email, patch) => {
    if (USE_FIREBASE) {
      await updateUserProfile(email, patch)
      logUserPatch(email, patch)
      return
    }
    setUsers((list) => list.map((u) => (u.email === email ? { ...u, ...patch } : u)))
    window.dispatchEvent(new CustomEvent('mock-profile-update', { detail: { email, patch } }))
  }, [])

  const pendingCount = users.filter((u) => u.status === 'pending').length
  return { users, loading, pendingCount, patchUser }
}
