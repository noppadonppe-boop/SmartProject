import { Clock, LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'

export default function PendingApprovalPage() {
  const { userProfile, signOut, refreshProfile } = useAuth()
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-7 text-center">
        <div className="mx-auto bg-amber-100 text-amber-600 w-14 h-14 rounded-full flex items-center justify-center mb-4">
          <Clock size={28} />
        </div>
        <h1 className="text-lg font-bold">Waiting for approval</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your account <span className="font-medium text-slate-700">{userProfile?.email}</span> has
          been created and is pending administrator approval. You will gain access once an admin
          approves your request.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button onClick={refreshProfile} className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-medium rounded-lg py-2.5 hover:bg-blue-700">
            <Loader2 size={16} /> Check status
          </button>
          <button onClick={signOut} className="inline-flex items-center justify-center gap-2 border border-slate-300 rounded-lg py-2.5 text-sm font-medium hover:bg-slate-50">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
