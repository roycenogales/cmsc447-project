import { Route, Routes } from 'react-router-dom'
import AuthProvider from './auth/AuthProvider'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import UploadPage from './pages/UploadPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
