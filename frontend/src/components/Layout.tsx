import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import HealthBadge from './HealthBadge'
import UmbcLogo from './UmbcLogo'

export default function Layout() {
  const { user, signOut } = useAuth()

  return (
    <div className="layout">
      <header className="header">
        <h1 className="brand">
          <UmbcLogo />
          Retriever Essentials Dashboard
        </h1>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/upload">Upload</NavLink>
        </nav>
        <HealthBadge />
        <span className="current-user">{user}</span>
        <button type="button" onClick={signOut}>
          Sign out
        </button>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
