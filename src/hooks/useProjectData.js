// Unified data hook. Works on local mock state by default; when
// VITE_USE_FIREBASE === "true" it reads/writes Firestore instead.

import { useCallback, useEffect, useRef, useState } from 'react'
import { USE_FIREBASE } from '../firebase'
import { mockProjects, mockTasks } from '../data/mockData'
import { isMasterAdmin } from '../auth/roles'
import { logActivity } from '../services/userService'
import * as svc from '../services/dataService'

let _idCounter = 1000
const newId = (p) => `${p}-${++_idCounter}`

// Scope projects to what a user is allowed to see:
//   MasterAdmin -> everything
//   others      -> projects in their company, plus assigned/owned projects as a fallback
function scopeProjects(all, userProfile, email) {
  if (!userProfile || isMasterAdmin(userProfile.role)) return all
  const companyId = userProfile.companyId || ''
  const assigned = userProfile.assignedProjects || []
  const isCompanyManager = Array.isArray(userProfile.role)
    ? userProfile.role.includes('CompanyManagement')
    : userProfile.role === 'CompanyManagement'

  if (isCompanyManager) {
    const assignedProjects = all.filter((p) => assigned.includes(p.id) || (email && p.owner === email))
    if (assignedProjects.length > 0) return assignedProjects
    return all.filter((p) => companyId && p.companyId && p.companyId === companyId)
  }

  return all.filter((p) => {
    if (companyId && p.companyId && p.companyId === companyId) return true
    return assigned.includes(p.id) || (email && p.owner === email)
  })
}

export function useProjectData(user, userProfile) {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [loading, setLoading] = useState(true)

  // ---- Undo / redo history (snapshots of projects + tasks) ----
  const [history, setHistory] = useState({ undo: [], redo: [] })
  const projectsRef = useRef(projects)
  const tasksRef = useRef(tasks)
  projectsRef.current = projects
  tasksRef.current = tasks

  const pushHistory = useCallback(() => {
    setHistory((h) => ({
      undo: [...h.undo, { projects: projectsRef.current, tasks: tasksRef.current }].slice(-50),
      redo: [],
    }))
  }, [])

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.undo.length) return h
      const prev = h.undo[h.undo.length - 1]
      const current = { projects: projectsRef.current, tasks: tasksRef.current }
      setProjects(prev.projects)
      setTasks(prev.tasks)
      return { undo: h.undo.slice(0, -1), redo: [...h.redo, current] }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((h) => {
      if (!h.redo.length) return h
      const next = h.redo[h.redo.length - 1]
      const current = { projects: projectsRef.current, tasks: tasksRef.current }
      setProjects(next.projects)
      setTasks(next.tasks)
      return { undo: [...h.undo, current], redo: h.redo.slice(0, -1) }
    })
  }, [])

  // Initial load.
  // Mock mode: load static data once.
  // Firebase mode: realtime subscription to projects, scoped to the user.
  useEffect(() => {
    if (USE_FIREBASE) return
    setProjects(scopeProjects(mockProjects, userProfile, user?.email))
    setTasks(mockTasks)
    const scoped = scopeProjects(mockProjects, userProfile, user?.email)
    setActiveProjectId((cur) => (cur && scoped.some((p) => p.id === cur) ? cur : scoped[0]?.id ?? null))
    setLoading(false)
  }, [userProfile, user?.email])

  useEffect(() => {
    if (!USE_FIREBASE) return
    if (!user) { setLoading(false); return }
    setLoading(true)
    const unsub = svc.subscribeProjects((all) => {
      const prj = scopeProjects(all, userProfile, user?.email)
      setProjects(prj)
      setActiveProjectId((cur) => (cur && prj.some((p) => p.id === cur) ? cur : prj[0]?.id ?? null))
      setLoading(false)
    })
    return () => unsub()
  }, [user?.email, userProfile])

  // Firebase mode: realtime task subscription for the active project.
  useEffect(() => {
    if (!USE_FIREBASE || !activeProjectId) return
    const unsub = svc.subscribeTasks(activeProjectId, (tsk) => {
      setTasks((prev) => [
        ...prev.filter((t) => t.projectId !== activeProjectId),
        ...tsk,
      ])
    })
    return () => unsub()
  }, [activeProjectId])

  const activeProject = projects.find((p) => p.id === activeProjectId) || null
  const projectTasks = tasks.filter((t) => t.projectId === activeProjectId)

  // ---- Projects ----
  const upsertProject = useCallback(
    async (data, id) => {
      const existing = id ? projectsRef.current.find((x) => x.id === id) : null
      const companyId = data.companyId || existing?.companyId || activeProject?.companyId || userProfile?.companyId || ''
      if (!companyId) throw new Error('Project company is required')
      pushHistory()
      const payload = {
        ...data,
        companyId,
      }
      if (!id && !payload.owner && user?.email) payload.owner = user.email
      if (USE_FIREBASE) {
        if (id) {
          await svc.saveProject(id, payload, existing?.companyId)
          setProjects((p) => p.map((x) => (x.id === id ? { ...x, ...payload } : x)))
          logActivity('PROJECT_UPDATE', { email: user?.email, projectName: payload.name })
        } else {
          const created = await svc.createProject(payload)
          setProjects((p) => [...p, created])
          setActiveProjectId(created.id)
          logActivity('PROJECT_CREATE', { email: user?.email, projectName: payload.name })
        }
        return
      }
      if (id) {
        setProjects((p) => p.map((x) => (x.id === id ? { ...x, ...payload } : x)))
      } else {
        const created = { id: newId('prj'), ...payload }
        setProjects((p) => [...p, created])
        setActiveProjectId(created.id)
      }
    },
    [activeProject?.companyId, user?.email, userProfile?.companyId]
  )

  // ---- Tasks ----
  const upsertTask = useCallback(
    async (data, id) => {
      pushHistory()
      const payload = { ...data, projectId: activeProjectId }
      if (USE_FIREBASE) {
        if (id) {
          await svc.saveTask(id, payload)
          setTasks((t) => t.map((x) => (x.id === id ? { ...x, ...payload } : x)))
        } else {
          const created = await svc.createTask(payload)
          setTasks((t) => [...t, created])
        }
        return
      }
      if (id) {
        setTasks((t) => t.map((x) => (x.id === id ? { ...x, ...payload } : x)))
      } else {
        setTasks((t) => [...t, { id: newId('t'), ...payload }])
      }
    },
    [activeProjectId]
  )

  const deleteTask = useCallback(async (id) => {
    pushHistory()
    if (USE_FIREBASE) await svc.removeTask(id)
    setTasks((t) => t.filter((x) => x.id !== id))
  }, [pushHistory])

  // ---- Baseline ----
  const saveBaseline = useCallback(() => {
    pushHistory()
    setTasks((ts) =>
      ts.map((t) => {
        if (t.projectId !== activeProjectId || t.isHeader || !t.planStartDate) return t
        const updated = { ...t, baselineStartDate: t.planStartDate, baselineEndDate: t.planEndDate }
        if (USE_FIREBASE) {
          svc.saveTask(t.id, {
            baselineStartDate: updated.baselineStartDate,
            baselineEndDate: updated.baselineEndDate,
          })
        }
        return updated
      })
    )
  }, [activeProjectId, pushHistory])

  return {
    loading,
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    tasks: projectTasks,
    upsertProject,
    upsertTask,
    deleteTask,
    saveBaseline,
    undo,
    redo,
    canUndo: history.undo.length > 0,
    canRedo: history.redo.length > 0,
  }
}
