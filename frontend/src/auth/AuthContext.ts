import { createContext, useContext } from 'react'

export interface AuthState {
  /** Username of the signed-in user, or null when signed out. */
  user: string | null
  signIn: (username: string) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside <AuthProvider>')
  return auth
}
