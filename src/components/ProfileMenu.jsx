import { useEffect, useRef, useState } from 'react'
import { UserCog, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { asRoleArray, roleLabel } from '../auth/roles'
import Avatar from './Avatar'
import ProfileModal from './ProfileModal'

// Top-right profile control: avatar (Google photo), dropdown -> Update profile + Logout.
export default function ProfileMenu() {
  const { userProfile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const fullName = `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || userProfile?.email

  return (
    <div className="relative no-print" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 border border-transparent hover:border-slate-200"
      >
        <Avatar profile={userProfile} size={34} />
        <ChevronDown size={15} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg z-[10010] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <Avatar profile={userProfile} size={40} />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{fullName}</div>
              <div className="text-xs text-slate-500 truncate">{userProfile?.email}</div>
              <div className="text-[11px] text-blue-600 truncate">
                {asRoleArray(userProfile?.role).map(roleLabel).join(', ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setEditing(true); setOpen(false) }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <UserCog size={16} /> Update profile
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}

      {editing && <ProfileModal onClose={() => setEditing(false)} />}
    </div>
  )
}
