import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from 'firebase/auth'
import { USE_FIREBASE, auth } from '../firebase'
import {
  fetchProfile,
  createUserProfile,
  updateUserProfile,
  subscribeProfile,
  logActivity,
} from '../services/userService'

const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  const keys1 = Object.keys(obj1), keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) return false;
  }
  return true;
}

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

// Session lifetime (12h). Stored immediately after sign-in to avoid races.
const SESSION_MS = 12 * 60 * 60 * 1000
const SESSION_KEY = 'sp_session_expiry'
const setSessionExpiry = () => {
  try { localStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_MS)) } catch {}
}
const sessionExpired = () => {
  try {
    const v = Number(localStorage.getItem(SESSION_KEY))
    return v && Date.now() > v
  } catch { return false }
}

// Demo profile used when Firebase is disabled (mock mode) — full MasterAdmin
// so the whole UI (sidebar, user management) is explorable without Firebase.
const DEMO_USER = { uid: 'demo', email: 'demo@smartproject.app', displayName: 'Demo User', photoURL: '' }
const DEMO_PROFILE = {
  uid: 'demo',
  email: 'demo@smartproject.app',
  firstName: 'Demo',
  lastName: 'Admin',
  position: 'Project Director',
  department: 'Management',
  role: ['MasterAdmin'],
  status: 'approved',
  assignedProjects: [],
  photoURL: '',
  isFirstUser: true,
}

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(USE_FIREBASE ? null : DEMO_USER)
  const [userProfile, setUserProfile] = useState(USE_FIREBASE ? null : DEMO_PROFILE)
  const [loading, setLoading] = useState(USE_FIREBASE)
  const profileUnsubRef = useRef(() => {})

  // Watch Firebase auth state; subscribe to the matching Firestore profile so
  // role / status / approval changes propagate live without a refresh.
  useEffect(() => {
    if (!USE_FIREBASE) return
    const unsub = onAuthStateChanged(auth, (u) => {
      profileUnsubRef.current?.()
      if (!u) {
        setFirebaseUser(null)
        setUserProfile(null)
        setLoading(false)
        return
      }
      if (sessionExpired()) {
        fbSignOut(auth).catch(() => {})
        return
      }
      setFirebaseUser(u)
      // Realtime profile subscription. fetchProfile failures stay silent.
      profileUnsubRef.current = subscribeProfile(u.email, (p) => {
        setUserProfile((prev) => deepEqual(prev, p) ? prev : p)
        setLoading(false)
      })
    })
    return () => {
      unsub()
      profileUnsubRef.current?.()
    }
  }, [])

  // Listen for mock updates so the app is Realtime even without Firebase
  useEffect(() => {
    if (USE_FIREBASE) return
    const handleMock = (e) => {
      const { email, patch } = e.detail
      setUserProfile((prev) => {
        if (prev && prev.email === email) {
          const next = { ...prev, ...patch }
          return deepEqual(prev, next) ? prev : next
        }
        return prev
      })
    }
    window.addEventListener('mock-profile-update', handleMock)
    return () => window.removeEventListener('mock-profile-update', handleMock)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!USE_FIREBASE || !auth.currentUser) return null
    const p = await fetchProfile(auth.currentUser.email)
    if (p) setUserProfile(p)
    return p
  }, [])

  const loginWithEmail = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    setSessionExpiry()
    const profile = (await fetchProfile(cred.user.email)) || (await createUserProfile(cred.user))
    logActivity('LOGIN', { email: cred.user.email, method: 'email' })
    setUserProfile(profile)
    return profile
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    setSessionExpiry()
    let profile = await fetchProfile(cred.user.email)
    if (!profile) {
      // New Google user → auto-create (first user → MasterAdmin, else Staff/pending)
      profile = await createUserProfile(cred.user)
      logActivity('REGISTER', { email: cred.user.email, method: 'google' })
    }
    logActivity('LOGIN', { email: cred.user.email, method: 'google' })
    setUserProfile(profile)
    return profile
  }, [])

  const registerWithEmail = useCallback(async (email, password, firstName, lastName, position, department) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    setSessionExpiry()
    const profile = await createUserProfile(cred.user, { firstName, lastName, position, department })
    logActivity('REGISTER', { email: cred.user.email, method: 'email' })
    setUserProfile(profile)
    return profile
  }, [])

  const updateOwnProfile = useCallback(async (patch) => {
    if (!USE_FIREBASE) {
      setUserProfile((p) => ({ ...p, ...patch }))
      return
    }
    const email = auth.currentUser?.email
    if (!email) return
    await updateUserProfile(email, patch)
    setUserProfile((p) => ({ ...(p || {}), ...patch }))
  }, [])

  const signOut = useCallback(async () => {
    try { localStorage.removeItem(SESSION_KEY) } catch {}
    if (!USE_FIREBASE) return
    profileUnsubRef.current?.()
    await fbSignOut(auth)
  }, [])

  const api = useMemo(
    () => ({
      // raw firebase user (kept as `user` for backward-compat with existing code)
      user: firebaseUser,
      firebaseUser,
      userProfile,
      loading,
      ready: !loading,
      isFirebase: USE_FIREBASE,
      loginWithEmail,
      loginWithGoogle,
      registerWithEmail,
      updateOwnProfile,
      refreshProfile,
      signOut,
    }),
    [firebaseUser, userProfile, loading, loginWithEmail, loginWithGoogle, registerWithEmail, updateOwnProfile, refreshProfile, signOut]
  )

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}
