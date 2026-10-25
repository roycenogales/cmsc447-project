import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import UploadPage from './pages/UploadPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
      </Route>
    </Routes>
  )
}
