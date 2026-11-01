import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, BookOpen, ClipboardList, TrendingUp, ArrowRight, Star } from 'lucide-react'
import { studentAPI, courseAPI, enrollmentAPI } from '../utils/api'
import { formatDate, getStatusBadge, getInitials, getAvatarColor, getGPAClass } from '../utils/helpers'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const PIE_COLORS = ['#4f8ef7', '#8b5cf6', '#14b8a6', '#f59e0b', '#f43f5e', '#10b981']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8, padding: '8px 12px', fontSize: 13
    }}>
      <p style={{ color: '#94a3b8' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [courseStats, setCourseStats] = useState(null)
  const [enrollStats, setEnrollStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, c, e] = await Promise.all([
          studentAPI.getStats(),
          courseAPI.getStats(),
          enrollmentAPI.getStats()
        ])
        setStats(s.data)
        setCourseStats(c.data)
        setEnrollStats(e.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading dashboard...</p>
      </div>
    )
  }

  const deptChartData = stats?.byDepartment?.map((d) => ({ name: d._id, Students: d.count })) || []
  const gradeData = enrollStats?.gradeDistribution?.map((g) => ({ name: g._id, value: g.count })) || []

  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      {/* Welcome Banner */}
      <div className="card" style={{
        marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(79,142,247,0.12) 0%, rgba(139,92,246,0.12) 100%)',
        borderColor: 'rgba(79,142,247,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
              Welcome back, <span className="gradient-text">Administrator</span> 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Here's an overview of your institution's academic performance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/students" className="btn btn-primary">
              <Users size={16} /> Manage Students
            </Link>
            <Link to="/enrollments" className="btn btn-secondary">
              <ClipboardList size={16} /> Enrollments
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="stat-card">
            <div className="stat-icon blue"><Users size={22} /></div>
            <div className="stat-info">
              <div className="stat-label">Total Students</div>
              <div className="stat-value">{stats?.total ?? 0}</div>
              <div className="stat-change">✦ {stats?.active ?? 0} Active</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-card">
            <div className="stat-icon purple"><BookOpen size={22} /></div>
            <div className="stat-info">
              <div className="stat-label">Total Courses</div>
              <div className="stat-value">{courseStats?.total ?? 0}</div>
              <div className="stat-change">✦ {courseStats?.active ?? 0} Active</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-card">
            <div className="stat-icon teal"><ClipboardList size={22} /></div>
            <div className="stat-info">
              <div className="stat-label">Enrollments</div>
              <div className="stat-value">{enrollStats?.total ?? 0}</div>
              <div className="stat-change">✦ All semesters</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="stat-card">
            <div className="stat-icon amber"><Star size={22} /></div>
            <div className="stat-info">
              <div className="stat-label">Avg GPA</div>
              <div className="stat-value">{stats?.avgGpa ?? '0.00'}</div>
              <div className="stat-change">✦ Institution-wide</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        {/* Department Chart */}
        <div className="card">
          <div className="section-title">Students by Department</div>
          {deptChartData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => v.substring(0, 4)} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Students" fill="url(#blueGrad)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f8ef7" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-state-icon">📊</div>
              <p>No data yet. Add students to see department stats.</p>
            </div>
          )}
        </div>

        {/* Grade Distribution Pie */}
        <div className="card">
          <div className="section-title">Grade Distribution</div>
          {gradeData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {gradeData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 13 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-state-icon">🎯</div>
              <p>No grades recorded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Students */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Recently Added Students</div>
          <Link to="/students" className="btn btn-ghost btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {stats?.recentStudents?.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>GPA</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentStudents.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="student-cell">
                        <div className="avatar" style={{ background: getAvatarColor(s.firstName) }}>
                          {getInitials(s.firstName, s.lastName)}
                        </div>
                        <div className="student-cell-info">
                          <div className="student-cell-name">{s.firstName} {s.lastName}</div>
                          <div className="student-cell-id">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>{s.studentId}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.department}</td>
                    <td>
                      <span className={`gpa-badge ${getGPAClass(s.gpa)}`}>{s.gpa?.toFixed(1)}</span>
                    </td>
                    <td><span className={`badge ${getStatusBadge(s.status)}`}>{s.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👩‍🎓</div>
            <h3>No students yet</h3>
            <p>Add your first student to get started.</p>
            <Link to="/students" className="btn btn-primary" style={{ marginTop: 16 }}>
              <Users size={16} /> Add Student
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
