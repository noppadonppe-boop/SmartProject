import { useState } from 'react'
import { UserCog } from 'lucide-react'
import Modal, { Field, inputCls } from './Modal'
import { useAuth } from '../auth/AuthContext'
import { DEPARTMENTS, roleLabel, asRoleArray } from '../auth/roles'
import Avatar from './Avatar'

// Self-service profile editor. A user may update their own personal details,
// but NOT their role / status / assigned projects (admin-controlled).
export default function ProfileModal({ onClose }) {
  const { userProfile, updateOwnProfile } = useAuth()
  const [form, setForm] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    position: userProfile?.position || '',
    department: userProfile?.department || '',
    photoURL: userProfile?.photoURL || '',
  })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setBusy(true)
    try {
      await updateOwnProfile(form)
      onClose()
    } finally { setBusy(false) }
  }

  return (
    <Modal
      title="My Profile"
      subtitle="Update your personal details"
      icon={UserCog}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-100">Cancel</button>
          <button onClick={submit} disabled={busy} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60">Save Changes</button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar profile={{ ...userProfile, ...form }} size={56} />
          <div className="text-sm">
            <div className="font-medium text-slate-800">{userProfile?.email}</div>
            <div className="text-slate-500">
              {asRoleArray(userProfile?.role).map(roleLabel).join(', ') || '—'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name"><input className={inputCls} value={form.firstName} onChange={set('firstName')} /></Field>
          <Field label="Last Name"><input className={inputCls} value={form.lastName} onChange={set('lastName')} /></Field>
        </div>
        <Field label="Position"><input className={inputCls} value={form.position} onChange={set('position')} /></Field>
        <Field label="Department">
          <select className={inputCls} value={form.department} onChange={set('department')}>
            <option value="">—</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Photo URL (optional)">
          <input className={inputCls} value={form.photoURL} onChange={set('photoURL')} placeholder="https://…" />
        </Field>
      </div>
    </Modal>
  )
}
