import { useLocation } from 'react-router-dom'
import { Wifi, WifiOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { checkHealth } from '../utils/api'

const titles = {
  '/': { title: 'Dashboard', subtitle: 'System overview & analytics' },
  '/students': { title: 'Students', subtitle: 'Manage student records' },
  '/courses': { title: 'Courses', subtitle: 'Academic course catalog' },
  '/enrollments': { title: 'Enrollments', subtitle: 'Student course enrollments & grades' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Academic performance insights' },
}

export default function Header() {
  const location = useLocation()
  const [online, setOnline] = useState(false)

  // Get title by best matching path prefix
  const pageKey = Object.keys(titles)
    .filter((k) => k === '/' ? location.pathname === '/' : location.pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0] || '/'
  const { title, subtitle } = titles[pageKey]

  useEffect(() => {
    const check = async () => {
      try {
        await checkHealth()
        setOnline(true)
      } catch {
        setOnline(false)
      }
    }
    check()
    const interval = setInterval(check, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="header">
      <div>
        <h2 className="header-title">{title}</h2>
        <p className="header-subtitle">{subtitle}</p>
      </div>
      <div className="header-right">
        <div className={`header-badge ${online ? '' : 'badge-error'}`}
          style={online ? {} : { background: 'rgba(244,63,94,0.1)', borderColor: 'rgba(244,63,94,0.3)', color: '#f43f5e' }}>
          <span className="status-dot" style={online ? {} : { background: '#f43f5e' }} />
          {online ? 'API Connected' : 'API Offline'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </header>
  )
}
