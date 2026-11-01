import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Courses from './pages/Courses'
import Enrollments from './pages/Enrollments'
import Reports from './pages/Reports'

/**
 * App.jsx - Root Application Component
 *
 * Implements a menu-driven interface architecture:
 * - Sidebar = main menu (analogous to a C++ console menu)
 * - Routes = function dispatch based on menu selection
 * - Each page = an isolated module (like a C++ translation unit)
 */
export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/enrollments" element={<Enrollments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={
              <div className="empty-state" style={{ paddingTop: 80 }}>
                <div className="empty-state-icon">🔍</div>
                <h3>Page Not Found</h3>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  )
}
