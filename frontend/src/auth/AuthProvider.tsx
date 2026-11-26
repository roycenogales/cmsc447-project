import { useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'

/** Holds the signed-in user in memory only, so a page refresh signs you out. */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)

  const value = useMemo(
    () => ({
      user,
      signIn: (username: string) => setUser(username),
      signOut: () => setUser(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
