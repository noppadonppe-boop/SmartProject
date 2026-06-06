import { useState } from 'react'
import { Building2, Mail, Lock, User, Briefcase, UserPlus, Loader2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { DEPARTMENTS } from '../../auth/roles'

const ERROR_MAP = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/weak-password': 'Password should be at least 6 characters.',
}
const msgFor = (err) =>
  ERROR_MAP[err?.code] || err?.message?.replace('Firebase: ', '') || 'Registration failed.'

export default function RegisterPage({ onGoLogin }) {
  const { registerWithEmail, refreshProfile } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', position: '', department: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await registerWithEmail(form.email, form.password, form.firstName, form.lastName, form.position, form.department)
      await refreshProfile()
    } catch (err) {
      setError(msgFor(err))
    } finally { setBusy(false) }
  }

  const input = 'w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 text-white p-2 rounded-lg"><Building2 size={22} /></div>
          <div>
            <h1 className="text-lg font-bold">Create your account</h1>
            <p className="text-xs text-slate-500">The first account becomes the Master Admin</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={input} placeholder="First name" value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className={input} placeholder="Last name" value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>
          <div className="relative">
            <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={input} placeholder="Position (e.g. Site Engineer)" value={form.position} onChange={set('position')} />
          </div>
          <div className="relative">
            <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select className={`${input} appearance-none`} value={form.department} onChange={set('department')}>
              <option value="">Select department…</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={input} type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={input} type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} required />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium rounded-lg py-2.5 hover:bg-blue-700 disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Create Account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button onClick={onGoLogin} className="text-blue-600 font-medium hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  )
}
