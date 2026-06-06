import { useCallback, useEffect, useState } from 'react'
import { USE_FIREBASE } from '../firebase'
import * as svc from '../services/companyService'

let _c = 0
const newId = () => `co-${Date.now()}-${++_c}`

const MOCK = [
  { id: 'co-1', name: 'Acme Engineering Co., Ltd.', code: 'ACME', contact: 'contact@acme.co' },
  { id: 'co-2', name: 'BuildRight Construction', code: 'BRC', contact: 'info@buildright.co' },
]

export function useCompanies() {
  const [companies, setCompanies] = useState(USE_FIREBASE ? [] : MOCK)

  useEffect(() => {
    if (!USE_FIREBASE) return
    const unsub = svc.subscribeCompanies(setCompanies)
    return () => unsub()
  }, [])

  const upsert = useCallback(async (data, id) => {
    if (USE_FIREBASE) {
      if (id) await svc.saveCompany(id, data)
      else await svc.createCompany(data)
      return
    }
    setCompanies((list) =>
      id ? list.map((c) => (c.id === id ? { ...c, ...data } : c)) : [...list, { id: newId(), ...data }]
    )
  }, [])

  const remove = useCallback(async (id) => {
    if (USE_FIREBASE) await svc.removeCompany(id)
    else setCompanies((list) => list.filter((c) => c.id !== id))
  }, [])

  return { companies, upsert, remove }
}
