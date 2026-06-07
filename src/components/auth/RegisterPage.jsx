import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import AuthLayout from './AuthLayout'

const ERROR_MAP = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/weak-password': 'Password should be at least 6 characters.',
}
const msgFor = (err) => ERROR_MAP[err?.code] || err?.message?.replace('Firebase: ', '') || 'Registration failed.'

export default function RegisterPage({ onGoLogin }) {
  const { registerWithEmail, loginWithGoogle, refreshProfile } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!agreed) {
      setError('Please agree to the terms and conditions.')
      return
    }
    setError(''); setBusy(true)
    try {
      const parts = form.name.trim().split(' ')
      const firstName = parts[0] || ''
      const lastName = parts.slice(1).join(' ') || ''
      await registerWithEmail(form.email, form.password, firstName, lastName, '', '')
      await refreshProfile()
    } catch (err) {
      setError(msgFor(err))
    } finally { setBusy(false) }
  }

  const InputRow = ({ label, type, placeholder, value, onChange }) => (
    <div className="mb-6">
      <label className="block text-sm font-bold text-slate-800 mb-1.5">{label}</label>
      <div className="relative">
        <input 
          type={type} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange} 
          required
          className="w-full border-b-2 border-blue-200 pb-2.5 text-base focus:outline-none focus:border-blue-500 bg-transparent placeholder-slate-300 text-slate-800 transition-colors"
        />
        {value.length > 0 && <Check size={18} className="absolute right-0 top-0 text-blue-500" />}
      </div>
    </div>
  )

  const google = async () => {
    setError(''); setBusy(true)
    try {
      await loginWithGoogle()
      await refreshProfile()
    } catch (err) {
      setError(msgFor(err))
    } finally { setBusy(false) }
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl md:text-[28px] font-extrabold text-slate-800 mb-10 md:mb-12 text-center tracking-tight">Create your account</h2>

      <form onSubmit={submit}>
        <InputRow label="Name" type="text" placeholder="Enter your name" value={form.name} onChange={set('name')} />
        <InputRow label="E-mail Adress" type="email" placeholder="Enter your mail" value={form.email} onChange={set('email')} />
        <InputRow label="Password" type="password" placeholder="Enter your password" value={form.password} onChange={set('password')} />

        <div className="flex items-center mb-10 mt-4">
          <div className="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer appearance-none w-5 h-5 border-2 border-blue-600 rounded bg-white checked:bg-blue-600 cursor-pointer mr-2.5 transition-colors" 
            />
            <Check size={14} strokeWidth={4} className="absolute left-0.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
          <label htmlFor="terms" className="text-sm font-medium text-slate-500 cursor-pointer">
            By Signing Up, I Agree with <span className="text-blue-600 font-bold hover:underline">Terms & Conditions</span>
          </label>
        </div>

        {error && <p className="mb-6 text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

        <div className="flex gap-4">
          <button type="submit" disabled={busy} className="flex-[1.2] flex items-center justify-center bg-[#1565D8] hover:bg-blue-700 text-white font-bold py-3 rounded-full text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-70">
            {busy ? <Loader2 size={18} className="animate-spin mr-2" /> : null} Sign Up
          </button>
          <button type="button" onClick={onGoLogin} disabled={busy} className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border-2 border-slate-200 font-bold py-3 rounded-full text-base transition-colors">
            Sign In
          </button>
        </div>
      </form>

      <div className="mt-8 flex justify-center">
        <button type="button" onClick={google} disabled={busy} className="w-full bg-[#f2f2f2] hover:bg-[#e5e5e5] text-[#1f1f1f] text-base font-semibold py-3 px-4 rounded-full flex items-center justify-center gap-3 transition-colors">
          <svg viewBox="0 0 48 48" width="24" height="24">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </AuthLayout>
  )
}
