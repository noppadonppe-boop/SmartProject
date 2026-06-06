// Avatar: shows Google/profile photo when available, otherwise initials.
export default function Avatar({ profile, size = 36, className = '' }) {
  const name = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
  const initials =
    (profile?.firstName?.[0] || profile?.email?.[0] || '?').toUpperCase() +
    (profile?.lastName?.[0] || '').toUpperCase()
  const style = { width: size, height: size }

  if (profile?.photoURL) {
    return (
      <img
        src={profile.photoURL}
        alt={name || profile?.email || 'user'}
        referrerPolicy="no-referrer"
        style={style}
        className={`rounded-full object-cover border border-slate-200 ${className}`}
      />
    )
  }
  return (
    <div
      style={style}
      className={`rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center border border-blue-200 ${className}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{initials}</span>
    </div>
  )
}
