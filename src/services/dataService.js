// Firestore CRUD helpers. Only used when USE_FIREBASE === true.
// The hook (useProjectData) falls back to local mock state otherwise.

import {
  collection,
  collectionGroup,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage, APP_NAME, COLLECTIONS } from '../firebase'

const LEGACY_PROJECTS = 'Projects'

const legacyProjectsCol = () => collection(db, LEGACY_PROJECTS)
const companyProjectsCol = (companyId) => collection(db, APP_NAME, 'root', 'companies', companyId, COLLECTIONS.PROJECTS)
const companyProjectDoc = (companyId, id) => doc(db, APP_NAME, 'root', 'companies', companyId, COLLECTIONS.PROJECTS, id)
const legacyProjectDoc = (id) => doc(db, LEGACY_PROJECTS, id)

const tasksCol = () => collection(db, APP_NAME, 'root', COLLECTIONS.TASKS)
const taskDoc = (id) => doc(db, APP_NAME, 'root', COLLECTIONS.TASKS, id)

function mapDocs(snap) {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

function mergeProjectLists(...lists) {
  const byId = new Map()
  for (const list of lists) {
    for (const project of list) byId.set(project.id, project)
  }
  return [...byId.values()]
}

export async function fetchProjects() {
  const [legacySnap, nestedSnap] = await Promise.all([
    getDocs(legacyProjectsCol()),
    getDocs(collectionGroup(db, COLLECTIONS.PROJECTS)),
  ])
  return mergeProjectLists(mapDocs(legacySnap), mapDocs(nestedSnap))
}

export async function fetchTasks(projectId) {
  const q = query(tasksCol(), where('projectId', '==', projectId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Realtime subscriptions (multi-user live sync). Return unsubscribe fns.
export function subscribeProjects(cb) {
  let legacy = []
  let nested = []
  let legacyReady = false
  let nestedReady = false

  const emit = () => {
    if (!legacyReady || !nestedReady) return
    cb(mergeProjectLists(legacy, nested))
  }

  const unsubLegacy = onSnapshot(
    legacyProjectsCol(),
    (snap) => {
      legacy = mapDocs(snap)
      legacyReady = true
      emit()
    },
    (err) => console.warn('subscribeProjects legacy error', err)
  )
  const unsubNested = onSnapshot(
    collectionGroup(db, COLLECTIONS.PROJECTS),
    (snap) => {
      nested = mapDocs(snap)
      nestedReady = true
      emit()
    },
    (err) => console.warn('subscribeProjects nested error', err)
  )

  return () => {
    unsubLegacy()
    unsubNested()
  }
}

export function subscribeTasks(projectId, cb) {
  const q = query(tasksCol(), where('projectId', '==', projectId))
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.warn('subscribeTasks error', err)
  )
}

export async function createProject(data) {
  const companyId = data.companyId || ''
  if (!companyId) throw new Error('createProject requires companyId')
  const ref = await addDoc(companyProjectsCol(companyId), {
    ...data,
    companyId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return { id: ref.id, ...data, companyId }
}

export async function saveProject(id, data, previousCompanyId = '') {
  const companyId = data.companyId || previousCompanyId || ''
  if (!companyId) throw new Error('saveProject requires companyId')
  await setDoc(
    companyProjectDoc(companyId, id),
    { ...data, companyId, updatedAt: serverTimestamp() },
    { merge: true }
  )
  if (previousCompanyId && previousCompanyId !== companyId) {
    await deleteDoc(companyProjectDoc(previousCompanyId, id))
  }
  await deleteDoc(legacyProjectDoc(id))
}

export async function removeProject(id, companyId) {
  if (companyId) {
    await deleteDoc(companyProjectDoc(companyId, id))
  }
  await deleteDoc(legacyProjectDoc(id))
  
  // Clean up all tasks associated with this project
  const q = query(tasksCol(), where('projectId', '==', id))
  const snap = await getDocs(q)
  const batch = snap.docs.map(d => deleteDoc(d.ref))
  await Promise.all(batch)
}

export async function createTask(data) {
  const ref = await addDoc(tasksCol(), { ...data, updatedAt: serverTimestamp() })
  return { id: ref.id, ...data }
}

export async function saveTask(id, data) {
  await updateDoc(taskDoc(id), { ...data, updatedAt: serverTimestamp() })
}

export async function removeTask(id) {
  await deleteDoc(taskDoc(id))
}

// Upload an attachment to Firebase Storage and return its download URL.
export async function uploadAttachment(file, projectId = 'shared') {
  const path = `attachments/${projectId}/${Date.now()}_${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return { name: file.name, url }
}
