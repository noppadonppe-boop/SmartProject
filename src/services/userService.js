// Firestore user-profile / app-meta / activity-log helpers.
// Data model:
//   {APP_NAME}/root/users/{email}        -> UserProfile
//   {APP_NAME}/root/appMeta/config       -> AppMetaConfig
//   {APP_NAME}/root/activityLogs/{auto}  -> activity entries
//
// UserProfile shape:
//   { uid, email, firstName, lastName, position, role: string[],
//     department?, status: 'pending'|'approved'|'rejected',
//     companyId?, assignedProjects: string[], createdAt, updatedAt, photoURL?, isFirstUser }

import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  runTransaction,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db, APP_NAME, COLLECTIONS } from '../firebase'

const norm = (email) => (email || '').trim().toLowerCase()

// ---- Doc / collection references ----
export const usersCol = () => collection(db, APP_NAME, 'root', COLLECTIONS.USERS)
export const userRef = (email) => doc(db, APP_NAME, 'root', COLLECTIONS.USERS, norm(email))
export const appMetaRef = () => doc(db, APP_NAME, 'root', COLLECTIONS.APP_META, 'config')
export const activityCol = () => collection(db, APP_NAME, 'root', COLLECTIONS.ACTIVITY_LOGS)

// ---- Profile reads ----
export async function fetchProfile(email) {
  try {
    const snap = await getDoc(userRef(email))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  } catch (err) {
    // Silent: never throw out of profile fetch (see AuthContext pitfalls).
    console.warn('fetchProfile failed', err)
    return null
  }
}

// Realtime subscription to a single profile. Returns unsubscribe fn.
export function subscribeProfile(email, cb) {
  return onSnapshot(
    userRef(email),
    (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    (err) => console.warn('subscribeProfile error', err)
  )
}

// Realtime subscription to users. Admins can read all users; company managers
// can subscribe to their own company only.
export function subscribeUsers(cb, { companyId = '' } = {}) {
  const ref = companyId
    ? query(usersCol(), where('companyId', '==', companyId))
    : usersCol()
  return onSnapshot(
    ref,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.warn('subscribeUsers error', err)
  )
}

export async function fetchUsers() {
  const snap = await getDocs(usersCol())
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ---- Profile creation with first-user detection ----
// Uses a transaction so the very first registered user is reliably promoted
// to MasterAdmin + approved, and AppMeta is kept consistent.
export async function createUserProfile(firebaseUser, extra = {}) {
  const email = norm(firebaseUser.email)
  const uRef = userRef(email)
  const mRef = appMetaRef()

  const profile = await runTransaction(db, async (tx) => {
    const existing = await tx.get(uRef)
    if (existing.exists()) return { id: existing.id, ...existing.data() }

    const metaSnap = await tx.get(mRef)
    const meta = metaSnap.exists() ? metaSnap.data() : {}
    const isFirstUser = !meta.firstUserRegistered

    const base = {
      uid: firebaseUser.uid,
      email,
      firstName: extra.firstName || firebaseUser.displayName?.split(' ')[0] || '',
      lastName: extra.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      position: extra.position || '',
      department: extra.department || '',
      companyId: extra.companyId || '',
      role: isFirstUser ? ['MasterAdmin'] : ['User'],
      status: isFirstUser ? 'approved' : 'pending',
      assignedProjects: [],
      photoURL: firebaseUser.photoURL || extra.photoURL || '',
      isFirstUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    tx.set(uRef, base)
    tx.set(
      mRef,
      {
        firstUserRegistered: true,
        totalUsers: (meta.totalUsers || 0) + 1,
        createdAt: meta.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
    return { id: email, ...base }
  })

  return profile
}

// ---- Profile updates ----
export async function updateUserProfile(email, patch) {
  await updateDoc(userRef(email), { ...patch, updatedAt: serverTimestamp() })
}

export async function setUserStatus(email, status) {
  await updateUserProfile(email, { status })
}

export async function setUserRoles(email, roles) {
  await updateUserProfile(email, { role: Array.isArray(roles) ? roles : [roles] })
}

export async function setAssignedProjects(email, projectIds) {
  await updateUserProfile(email, { assignedProjects: projectIds })
}

export async function setUserCompany(email, companyId) {
  await updateUserProfile(email, { companyId })
}

// ---- App meta ----
export function subscribeAppMeta(cb) {
  return onSnapshot(
    appMetaRef(),
    (snap) => cb(snap.exists() ? snap.data() : null),
    (err) => console.warn('subscribeAppMeta error', err)
  )
}

// ---- Activity logging (non-blocking) ----
export function logActivity(action, data = {}) {
  // Fire-and-forget. Never let a log failure block the auth flow.
  addDoc(activityCol(), {
    action,
    ...data,
    at: serverTimestamp(),
  }).catch(() => {})
}

// Realtime subscription to the most recent activity entries (admin view).
// Returns an unsubscribe fn. Entries are ordered newest-first.
export function subscribeActivity(cb, max = 200) {
  const q = query(activityCol(), orderBy('at', 'desc'), limit(max))
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.warn('subscribeActivity error', err)
  )
}
