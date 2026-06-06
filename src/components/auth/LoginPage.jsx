import { useState } from 'react'
import { Building2, Mail, Lock, LogIn, Loader2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'

const ERROR_MAP = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/user-not-found': 'No account found for this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
  'auth/unauthorized-domain': 'This domain is not authorized for Google sign-in.',
}
const msgFor = (err) =>
  ERROR_MAP[err?.code] || err?.message?.replace('Firebase: ', '') || 'Authentication failed.'

export default function LoginPage({ onGoRegister, rejected }) {
  const { loginWithEmail, loginWithGoogle, refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await loginWithEmail(email, password)
      await refreshProfile()
    } catch (err) {
      setError(msgFor(err))
    } finally { setBusy(false) }
  }

  const google = async () => {
    setError(''); setBusy(true)
    try {
      await loginWithGoogle()
      await refreshProfile() // new google users: profile created after auth fires
    } catch (err) {
      setError(msgFor(err))
    } finally { setBusy(false) }
  }

  const input = 'w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 text-white p-2 rounded-lg"><Building2 size={22} /></div>
          <div>
            <h1 className="text-lg font-bold">SmartProject</h1>
            <p className="text-xs text-slate-500">Sign in to your projects</p>
          </div>
        </div>

        {rejected && (
          <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            Your account access was rejected. Please contact an administrator.
          </p>
        )}

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium rounded-lg py-2.5 hover:bg-blue-700 disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />} Sign In
          </button>
        </form>

        <button onClick={google} disabled={busy} className="mt-3 w-full inline-flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-60">
          <span className="font-bold text-base text-blue-600">G</span> Continue with Google
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <button onClick={onGoRegister} className="text-blue-600 font-medium hover:underline">Sign up</button>
        </p>
      </div>
    </div>
  )
}
