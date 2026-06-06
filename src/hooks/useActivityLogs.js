// Realtime activity log feed (admin use). In mock mode returns a small demo
// set so the Activity Log view is explorable without Firebase.
import { useEffect, useState } from 'react'
import { USE_FIREBASE } from '../firebase'
import { subscribeActivity } from '../services/userService'

const now = Date.now()
const min = 60 * 1000
const MOCK_LOGS = [
  { id: 'a1', action: 'LOGIN', email: 'demo@smartproject.app', method: 'google', at: new Date(now - 2 * min) },
  { id: 'a2', action: 'PROJECT_UPDATE', email: 'demo@smartproject.app', projectName: 'Wastewater Treatment Plant Upgrade', at: new Date(now - 18 * min) },
  { id: 'a3', action: 'USER_APPROVE', email: 'demo@smartproject.app', targetEmail: 'malee@example.com', at: new Date(now - 55 * min) },
  { id: 'a4', action: 'USER_ROLE_CHANGE', email: 'demo@smartproject.app', targetEmail: 'somchai@example.com', detail: 'Company Management', at: new Date(now - 3 * 60 * min) },
  { id: 'a5', action: 'REGISTER', email: 'malee@example.com', method: 'email', at: new Date(now - 26 * 60 * min) },
]

// Normalize a Firestore Timestamp | Date | number | string to a JS Date.
export function toDate(at) {
  if (!at) return null
  if (typeof at.toDate === 'function') return at.toDate()
  if (at instanceof Date) return at
  return new Date(at)
}

export function useActivityLogs(max = 200) {
  const [logs, setLogs] = useState(USE_FIREBASE ? [] : MOCK_LOGS)
  const [loading, setLoading] = useState(USE_FIREBASE)

  useEffect(() => {
    if (!USE_FIREBASE) return
    const unsub = subscribeActivity((list) => {
      setLogs(list)
      setLoading(false)
    }, max)
    return () => unsub()
  }, [max])

  return { logs, loading }
}
