// Unified data hook. Works on local mock state by default; when
// VITE_USE_FIREBASE === "true" it reads/writes Firestore instead.

import { useCallback, useEffect, useRef, useState } from 'react'
import { USE_FIREBASE } from '../firebase'
import { mockProjects, mockTasks } from '../data/mockData'
import { isMasterAdmin, isCompanyManagement } from '../auth/roles'
import { logActivity, updateUserProfile } from '../services/userService'
import * as svc from '../services/dataService'
import { showAlert } from '../components/GlobalDialog'

let _idCounter = 1000
const newId = (p) => `${p}-${++_idCounter}`

// Scope projects to what a user is allowed to see:
//   MasterAdmin -> everything
//   CompanyManagement -> projects in their company, plus assigned/owned
//   others      -> only assigned/owned projects
function scopeProjects(all, userProfile, email, headerCompanyId = '') {
  if (!userProfile) return all
  if (isMasterAdmin(userProfile.role)) {
    return headerCompanyId ? all.filter((p) => p.companyId === headerCompanyId) : all
  }
  const assigned = userProfile.assignedProjects || []

  if (isCompanyManagement(userProfile.role)) {
    const companyId = userProfile.companyId || ''
    return all.filter((p) => {
      if (companyId && p.companyId === companyId) return true
      return assigned.includes(p.id) || (email && p.owner === email)
    })
  }

  return all.filter((p) => {
    return assigned.includes(p.id) || (email && p.owner === email)
  })
}

export function useProjectData(user, userProfile, headerCompanyId = '') {
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
    const scoped = scopeProjects(mockProjects, userProfile, user?.email, headerCompanyId)
    setProjects(scoped)
    setTasks(mockTasks)
    setActiveProjectId((cur) => (cur && scoped.some((p) => p.id === cur) ? cur : null))
    setLoading(false)
  }, [userProfile, user?.email, headerCompanyId])

  useEffect(() => {
    if (!USE_FIREBASE) return
    if (!user) { setLoading(false); return }
    setLoading(true)
    const unsub = svc.subscribeProjects((all) => {
      const prj = scopeProjects(all, userProfile, user?.email, headerCompanyId)
      setProjects(prj)
      setActiveProjectId((cur) => (cur && prj.some((p) => p.id === cur) ? cur : null))
      setLoading(false)
    })
    return () => unsub()
  }, [user?.email, userProfile, headerCompanyId])

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
          setProjects((p) => p.some(x => x.id === created.id) ? p : [...p, created])
          setActiveProjectId(created.id)
          logActivity('PROJECT_CREATE', { email: user?.email, projectName: payload.name })

          if (user?.email && userProfile) {
            const currentAssigned = userProfile.assignedProjects || []
            if (!currentAssigned.includes(created.id)) {
              await updateUserProfile(user.email, { assignedProjects: [...currentAssigned, created.id] })
            }
          }
        }
        return
      }
      if (id) {
        setProjects((p) => p.map((x) => (x.id === id ? { ...x, ...payload } : x)))
      } else {
        const created = { id: newId('prj'), ...payload }
        setProjects((p) => p.some(x => x.id === created.id) ? p : [...p, created])
        setActiveProjectId(created.id)

        if (user?.email && userProfile) {
          const currentAssigned = userProfile.assignedProjects || []
          if (!currentAssigned.includes(created.id)) {
            window.dispatchEvent(new CustomEvent('mock-profile-update', {
              detail: { email: user.email, patch: { assignedProjects: [...currentAssigned, created.id] } }
            }))
          }
        }
      }
    },
    [activeProject?.companyId, user?.email, userProfile]
  )

  const deleteProject = useCallback(
    async (id) => {
      const existing = projectsRef.current.find((x) => x.id === id)
      if (!existing) return
      pushHistory()
      
      if (USE_FIREBASE) {
        await svc.removeProject(id, existing.companyId)
        setProjects((p) => p.filter((x) => x.id !== id))
        logActivity('PROJECT_DELETE', { email: user?.email, projectName: existing.name })
      } else {
        setProjects((p) => p.filter((x) => x.id !== id))
      }
      if (activeProjectId === id) {
        setActiveProjectId(null)
      }
    },
    [activeProjectId, user?.email]
  )

  const duplicateProject = useCallback(
    async (id, newName) => {
      const existingProject = projectsRef.current.find((x) => x.id === id)
      if (!existingProject) return

      pushHistory()

      const payload = { ...existingProject, name: newName }
      delete payload.id

      if (USE_FIREBASE) {
        // Create project
        const createdProject = await svc.createProject(payload)
        
        // Auto-assign
        if (user?.email && userProfile) {
          const currentAssigned = userProfile.assignedProjects || []
          if (!currentAssigned.includes(createdProject.id)) {
            await updateUserProfile(user.email, { assignedProjects: [...currentAssigned, createdProject.id] })
          }
        }
        
        // Duplicate tasks
        const existingTasks = await svc.fetchTasks(id)
        const idMap = {}
        
        // Pass 1: create tasks
        for (const t of existingTasks) {
          const tPayload = { ...t, projectId: createdProject.id }
          delete tPayload.id
          delete tPayload.createdAt
          delete tPayload.updatedAt
          tPayload.dependencies = []
          const createdTask = await svc.createTask(tPayload)
          idMap[t.id] = createdTask.id
        }
        
        // Pass 2: update dependencies
        for (const t of existingTasks) {
          if (t.dependencies && t.dependencies.length > 0) {
            const newDeps = t.dependencies.map(d => idMap[d]).filter(Boolean)
            if (newDeps.length > 0) {
              await svc.saveTask(idMap[t.id], { dependencies: newDeps })
            }
          }
        }

        logActivity('PROJECT_CREATE', { email: user?.email, projectName: newName })
        setProjects((p) => p.some(x => x.id === createdProject.id) ? p : [...p, createdProject])
        setActiveProjectId(createdProject.id)
      } else {
        // Mock mode
        const createdProject = { id: newId('prj'), ...payload }
        
        const existingTasks = tasksRef.current.filter((t) => t.projectId === id)
        const idMap = {}
        const newTasks = existingTasks.map((t) => {
          const nid = newId('t')
          idMap[t.id] = nid
          return { ...t, id: nid, projectId: createdProject.id }
        })
        newTasks.forEach((t) => {
          if (t.dependencies) {
            t.dependencies = t.dependencies.map((d) => idMap[d]).filter(Boolean)
          }
        })
        
        setProjects((p) => p.some(x => x.id === createdProject.id) ? p : [...p, createdProject])
        
        // Remove duplicates from tasks array when appending new tasks
        setTasks((prev) => {
          const existingIds = new Set(prev.map(t => t.id))
          const trulyNew = newTasks.filter(t => !existingIds.has(t.id))
          return [...prev, ...trulyNew]
        })
        setActiveProjectId(createdProject.id)
        
        if (user?.email && userProfile) {
          const currentAssigned = userProfile.assignedProjects || []
          if (!currentAssigned.includes(createdProject.id)) {
            window.dispatchEvent(new CustomEvent('mock-profile-update', {
              detail: { email: user.email, patch: { assignedProjects: [...currentAssigned, createdProject.id] } }
            }))
          }
        }
      }
    },
    [user?.email, userProfile]
  )

  // ---- Tasks ----
  const upsertTask = useCallback(
    async (data, id) => {
      const currentTasks = tasksRef.current.filter((t) => t.projectId === activeProjectId)
      let currentTotalWeight = 0
      currentTasks.forEach((t) => {
        if (t.id !== id && !t.isHeader) {
          currentTotalWeight += Number(t.weight || 0)
        }
      })
      
      const newWeight = data.weight !== undefined 
        ? Number(data.weight) 
        : (id ? Number(currentTasks.find(t => t.id === id)?.weight || 0) : 0)

      if (currentTotalWeight + newWeight > 100) {
        await showAlert(`Cannot save task: Total WT% exceeds 100%.\n(Current total: ${currentTotalWeight.toFixed(2)}%, adding: ${newWeight}%)`, 'Limit Exceeded', 'error')
        return false
      }

      pushHistory()
      const payload = { ...data, projectId: activeProjectId }
      if (USE_FIREBASE) {
        if (id) {
          await svc.saveTask(id, payload)
          setTasks((t) => t.map((x) => (x.id === id ? { ...x, ...payload } : x)))
        } else {
          const created = await svc.createTask(payload)
          setTasks((t) => t.some(x => x.id === created.id) ? t : [...t, created])
        }
        return true
      }
      if (id) {
        setTasks((t) => t.map((x) => (x.id === id ? { ...x, ...payload } : x)))
      } else {
        setTasks((t) => {
          const newIdVal = newId('t')
          return t.some(x => x.id === newIdVal) ? t : [...t, { id: newIdVal, ...payload }]
        })
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
    duplicateProject,
    deleteProject,
    upsertTask,
    deleteTask,
    saveBaseline,
    undo,
    redo,
    canUndo: history.undo.length > 0,
    canRedo: history.redo.length > 0,
  }
}
