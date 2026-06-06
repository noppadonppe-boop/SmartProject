// Seed Firestore with the mock Companies, Projects, and Tasks.
//
// Usage (PowerShell):
//   1. Fill in your real Firebase keys in .env.local
//   2. Set VITE_USE_FIREBASE=true
//   3. Run:  node scripts/seed.mjs
//
// This uses the Firebase Web SDK and reads config from .env.local. Your
// Firestore security rules must allow writes for this to succeed (e.g. run
// while in test mode, or temporarily allow your account).

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  writeBatch,
} from 'firebase/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// --- Minimal .env.local parser (no extra deps) ---
function loadEnv() {
  const env = {}
  try {
    const raw = readFileSync(resolve(root, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    console.error('Could not read .env.local — create it from .env.example first.')
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

// Import mock data (ESM).
const { mockProjects, mockTasks } = await import('../src/data/mockData.js')

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const APP_NAME = 'SmartProject'

const companiesCol = () => collection(db, APP_NAME, 'root', 'companies')
const companyProjectDoc = (companyId, projectId) => doc(db, APP_NAME, 'root', 'companies', companyId, 'projects', projectId)
const tasksCol = () => collection(db, 'Tasks')

async function run() {
  const companyId = 'cmg-tech-partner'
  console.log(`Seeding company, ${mockProjects.length} projects and ${mockTasks.length} tasks…`)

  await setDoc(doc(companiesCol(), companyId), {
    name: 'CMG-Tech-Partner',
    code: 'CMG',
    contact: '',
  })

  for (const p of mockProjects) {
    const { id, ...data } = p
    await setDoc(companyProjectDoc(companyId, id), {
      ...data,
      companyId,
    })
  }

  // Batch tasks (Firestore batch limit is 500).
  let batch = writeBatch(db)
  let count = 0
  for (const t of mockTasks) {
    const { id, ...data } = t
    batch.set(doc(tasksCol(), id), data)
    if (++count % 400 === 0) {
      await batch.commit()
      batch = writeBatch(db)
    }
  }
  await batch.commit()

  console.log('Done. Firestore seeded successfully.')
  process.exit(0)
}

run().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
