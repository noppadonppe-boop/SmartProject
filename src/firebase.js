// Firebase initialization.
// Safe to import even when env vars are placeholders: Firestore is only
// initialized when VITE_USE_FIREBASE === "true". Otherwise the app runs on
// local mock data (see src/data/mockData.js).

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true'

let app = null
let db = null
let storage = null
let auth = null

if (USE_FIREBASE) {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
  storage = getStorage(app)
  auth = getAuth(app)
}

export { app, db, storage, auth }

// Application namespace. All auth/user data lives under {APP_NAME}/root/...
export const APP_NAME = 'SmartProject'

// Firestore collection names — keep centralized.
export const COLLECTIONS = {
  PROJECTS: 'projects',
  TASKS: 'Tasks',
  // Nested under APP_NAME/root
  USERS: 'users',
  APP_META: 'appMeta',
  ACTIVITY_LOGS: 'activityLogs',
}
