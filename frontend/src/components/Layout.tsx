import { NavLink, Outlet } from 'react-router-dom'
import HealthBadge from './HealthBadge'

export default function Layout() {
  return (
    <div className="layout">
      <header className="header">
        <h1>Retriever Essentials Dashboard</h1>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/upload">Upload</NavLink>
        </nav>
        <HealthBadge />
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
