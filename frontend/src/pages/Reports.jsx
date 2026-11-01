import { useEffect, useState } from 'react'
import { studentAPI, courseAPI, enrollmentAPI } from '../utils/api'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts'

const COLORS = ['#4f8ef7', '#8b5cf6', '#14b8a6', '#f59e0b', '#f43f5e', '#10b981', '#6366f1', '#ec4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
      {label && <p style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ color: p.color || '#f0f4ff', fontWeight: 600 }}>{p.name || 'Value'}: {p.value}</p>)}
    </div>
  )
}

export default function Reports() {
  const [studentStats, setStudentStats] = useState(null)
  const [courseStats, setCourseStats] = useState(null)
  const [enrollStats, setEnrollStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([studentAPI.getStats(), courseAPI.getStats(), enrollmentAPI.getStats()])
      .then(([s, c, e]) => { setStudentStats(s.data); setCourseStats(c.data); setEnrollStats(e.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Loading reports...</p></div>

  const deptData = studentStats?.byDepartment?.map((d) => ({ name: d._id.slice(0, 8), Students: d.count })) || []
  const yearData = studentStats?.byYear?.map((d) => ({ name: `Year ${d._id}`, Students: d.count })) || []
  const gradeData = enrollStats?.gradeDistribution?.map((g) => ({ name: g._id, value: g.count })) || []
  const statusData = enrollStats?.byStatus?.map((s) => ({ name: s._id, value: s.count })) || []
  const topCourses = enrollStats?.topCourses || []

  const ChartCard = ({ title, children }) => (
    <div className="card">
      <div className="section-title">{title}</div>
      {children}
    </div>
  )

  const StatRow = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  )

  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Reports & Analytics</h1>
          <p>Academic performance insights across departments, courses, and grades</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Students', value: studentStats?.total, color: 'var(--accent-blue)' },
          { label: 'Active Students', value: studentStats?.active, color: 'var(--accent-emerald)' },
          { label: 'Total Courses', value: courseStats?.total, color: 'var(--accent-purple)' },
          { label: 'Avg Institution GPA', value: studentStats?.avgGpa, color: 'var(--accent-amber)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 800, color, marginBottom: 6 }}>{value ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <ChartCard title="Students by Department">
          {deptData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Students" radius={[4, 4, 0, 0]}>
                    {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="empty-state" style={{ padding: 30 }}><p>No data available</p></div>}
        </ChartCard>

        <ChartCard title="Students by Year">
          {yearData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id="yr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#4f8ef7" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="Students" fill="url(#yr)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="empty-state" style={{ padding: 30 }}><p>No data available</p></div>}
        </ChartCard>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <ChartCard title="Grade Distribution">
          {gradeData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gradeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 13 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="empty-state" style={{ padding: 30 }}><p>No grades recorded yet</p></div>}
        </ChartCard>

        <ChartCard title="Enrollment Status Breakdown">
          {statusData.length > 0 ? (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={3}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 13 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <div className="empty-state" style={{ padding: 30 }}><p>No enrollment data yet</p></div>}
        </ChartCard>
      </div>

      {/* Top Courses Table */}
      <div className="card">
        <div className="section-title">Top Enrolled Courses</div>
        {topCourses.length > 0 ? (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Course</th>
                <th>Code</th>
                <th>Total Enrollments</th>
              </tr>
            </thead>
            <tbody>
              {topCourses.map((c, i) => (
                <tr key={c._id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 18 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.courseName}</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-purple)' }}>{c.courseCode}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="progress-bar" style={{ width: 100 }}>
                        <div className="progress-fill" style={{ width: `${(c.count / (topCourses[0]?.count || 1)) * 100}%` }} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{c.count}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state" style={{ padding: 30 }}>
            <div className="empty-state-icon">📊</div>
            <p>No enrollment data available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
