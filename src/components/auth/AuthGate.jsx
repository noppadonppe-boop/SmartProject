import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { hasModuleAccess } from '../../auth/roles'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import PendingApprovalPage from './PendingApprovalPage'

function Spinner({ label }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-slate-500">
      <Loader2 className="animate-spin mr-2" /> {label}
    </div>
  )
}

// Guard order (mirrors the ProtectedRoute spec):
//   loading            -> spinner
//   !firebaseUser      -> login / register
//   !userProfile       -> spinner (profile still loading)
//   status pending     -> pending page
//   status rejected    -> login with message
//   requireRoles fail  -> access denied
//   approved           -> render children
export default function AuthGate({ children, requireRoles }) {
  const { firebaseUser, userProfile, loading, isFirebase } = useAuth()
  const [view, setView] = useState('login') // 'login' | 'register'

  if (isFirebase && loading) return <Spinner label="Checking session…" />

  if (isFirebase && !firebaseUser) {
    return view === 'register'
      ? <RegisterPage onGoLogin={() => setView('login')} />
      : <LoginPage onGoRegister={() => setView('register')} />
  }

  if (isFirebase && firebaseUser && !userProfile) return <Spinner label="Loading profile…" />

  const status = userProfile?.status
  if (status === 'pending') return <PendingApprovalPage />
  if (status === 'rejected') return <LoginPage onGoRegister={() => setView('register')} rejected />

  if (requireRoles?.length && !requireRoles.some((m) => hasModuleAccess(userProfile?.role, m))) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        You do not have access to this area.
      </div>
    )
  }

  return children
}
