import { AuthProvider } from './auth/AuthContext'
import AuthGate from './components/auth/AuthGate'
import AppShell from './components/AppShell'
import GlobalDialog from './components/GlobalDialog'

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppShell />
      </AuthGate>
      <GlobalDialog />
    </AuthProvider>
  )
}
