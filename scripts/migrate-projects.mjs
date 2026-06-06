// Migrate legacy top-level Projects documents into a company-scoped
// collection under SmartProject/root/companies/{companyId}/projects.
//
// Usage (PowerShell):
//   1. Fill in your real Firebase keys in .env.local
//   2. Set VITE_USE_FIREBASE=true
//   3. Run:  node scripts/migrate-projects.mjs
//
// This script copies every document from /Projects into the target company
// subcollection, adds companyId to each project, and then deletes the legacy
// top-level document once the copy succeeds.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const LEGACY_PROJECTS = 'Projects'
const APP_NAME = 'SmartProject'
const TARGET_COMPANY_ID = 'cmg-tech-partner'
const TARGET_COMPANY_NAME = 'CMG-Tech-Partner'

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

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const companiesCol = () => collection(db, APP_NAME, 'root', 'companies')
const legacyProjectsCol = () => collection(db, LEGACY_PROJECTS)
const targetProjectDoc = (projectId) => doc(db, APP_NAME, 'root', 'companies', TARGET_COMPANY_ID, 'projects', projectId)
const legacyProjectDoc = (projectId) => doc(db, LEGACY_PROJECTS, projectId)

async function run() {
  const snap = await getDocs(legacyProjectsCol())
  const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

  if (!projects.length) {
    console.log('No legacy Projects documents found. Nothing to migrate.')
    process.exit(0)
  }

  console.log(`Migrating ${projects.length} legacy project(s) into company ${TARGET_COMPANY_NAME}…`)

  await setDoc(doc(companiesCol(), TARGET_COMPANY_ID), {
    name: TARGET_COMPANY_NAME,
    code: 'CMG',
    contact: '',
  }, { merge: true })

  let copied = 0
  for (const project of projects) {
    const { id, ...data } = project
    await setDoc(targetProjectDoc(id), {
      ...data,
      companyId: TARGET_COMPANY_ID,
    }, { merge: true })
    await deleteDoc(legacyProjectDoc(id))
    copied += 1
    console.log(`Migrated project ${id}`)
  }

  console.log(`Done. Migrated ${copied} project(s) to ${TARGET_COMPANY_NAME}.`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
