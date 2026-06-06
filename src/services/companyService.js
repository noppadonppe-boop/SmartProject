// Company CRUD under {APP_NAME}/root/companies. Realtime in Firebase mode.
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db, APP_NAME } from '../firebase'

const companiesCol = () => collection(db, APP_NAME, 'root', 'companies')

export function subscribeCompanies(cb) {
  return onSnapshot(
    companiesCol(),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => console.warn('subscribeCompanies error', err)
  )
}

export async function createCompany(data) {
  const ref = await addDoc(companiesCol(), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return { id: ref.id, ...data }
}

export async function saveCompany(id, data) {
  await updateDoc(doc(db, APP_NAME, 'root', 'companies', id), { ...data, updatedAt: serverTimestamp() })
}

export async function removeCompany(id) {
  await deleteDoc(doc(db, APP_NAME, 'root', 'companies', id))
}
