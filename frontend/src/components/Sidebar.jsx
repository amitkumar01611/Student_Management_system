import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  GraduationCap, Settings, BarChart3
} from 'lucide-react'

// Navigation menu items - analogous to a C++ menu-driven interface
const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Students', path: '/students', icon: Users },
  { label: 'Courses', path: '/courses', icon: BookOpen },
  { label: 'Enrollments', path: '/enrollments', icon: ClipboardList },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🎓</div>
        <div className="logo-text">
          <span className="logo-title">EduCore</span>
          <span className="logo-subtitle">Management System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-label">Main Menu</span>
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={18} />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="nav-section">
          <span className="nav-section-label">System</span>
          <div className="nav-item">
            <Settings className="nav-icon" size={18} />
            Settings
          </div>
        </div>
      </nav>

      {/* Footer user info */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <div className="user-name">Admin</div>
            <div className="user-role">System Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
