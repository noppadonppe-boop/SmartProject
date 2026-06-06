import { AuthProvider } from './auth/AuthContext'
import AuthGate from './components/auth/AuthGate'
import AppShell from './components/AppShell'

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppShell />
      </AuthGate>
    </AuthProvider>
  )
}
