import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnv() {
  const env = {}
  try {
    const raw = readFileSync(resolve(root, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    console.error('Could not read .env.local')
    process.exit(1)
  }
  return env
}

const env = loadEnv()
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.projectId || firebaseConfig.projectId === 'your-project-id') {
  console.error('Firebase config looks like placeholders. Fill in .env.local first.')
  process.exit(1)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const APP_NAME = 'SmartProject'

async function deleteCollection(colRef) {
  const snapshot = await getDocs(colRef)
  let count = 0
  for (const docSnap of snapshot.docs) {
    await deleteDoc(docSnap.ref)
    count++
  }
  return count
}

async function run() {
  console.log('Starting data cleanup...')

  // Delete Tasks from root (incorrect path from before)
  const rootTasksCol = collection(db, 'Tasks')
  const rootTasksDeleted = await deleteCollection(rootTasksCol)
  console.log(`Deleted ${rootTasksDeleted} tasks from root 'Tasks'.`)

  // Delete Tasks from correct path
  const tasksCol = collection(db, APP_NAME, 'root', 'Tasks')
  const tasksDeleted = await deleteCollection(tasksCol)
  console.log(`Deleted ${tasksDeleted} tasks from ${APP_NAME}/root/Tasks.`)

  // Get all companies to delete their projects first
  const companiesCol = collection(db, APP_NAME, 'root', 'companies')
  const companiesSnap = await getDocs(companiesCol)
  
  let projectsDeleted = 0
  for (const compSnap of companiesSnap.docs) {
    const projectsCol = collection(db, APP_NAME, 'root', 'companies', compSnap.id, 'projects')
    projectsDeleted += await deleteCollection(projectsCol)
  }
  console.log(`Deleted ${projectsDeleted} projects.`)

  // Delete companies
  const companiesDeleted = await deleteCollection(companiesCol)
  console.log(`Deleted ${companiesDeleted} companies.`)

  console.log('Cleanup complete.')
  process.exit(0)
}

run().catch((err) => {
  console.error('Cleanup failed:', err)
  process.exit(1)
})
