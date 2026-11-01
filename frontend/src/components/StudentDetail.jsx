import { useEffect, useState } from 'react'
import { enrollmentAPI } from '../utils/api'
import { formatDate, getStatusBadge, getInitials, getAvatarColor, getGPAClass } from '../utils/helpers'
import { Mail, Phone, MapPin, Calendar, BookOpen, Star } from 'lucide-react'

export default function StudentDetail({ student }) {
  const [enrollments, setEnrollments] = useState([])
  const [loadingEnroll, setLoadingEnroll] = useState(true)

  useEffect(() => {
    if (!student?._id) return
    enrollmentAPI.getAll({ studentId: student._id, limit: 20 })
      .then((r) => setEnrollments(r.data))
      .catch(console.error)
      .finally(() => setLoadingEnroll(false))
  }, [student._id])

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
      <div style={{ color: 'var(--accent-blue)', flexShrink: 0 }}><Icon size={16} /></div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', width: 100, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  )

  return (
    <div>
      {/* Student Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: 20, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
        <div className="avatar avatar-lg" style={{ background: getAvatarColor(student.firstName) }}>
          {getInitials(student.firstName, student.lastName)}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{student.firstName} {student.lastName}</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent-blue)' }}>{student.studentId}</span>
            <span className={`badge ${getStatusBadge(student.status)}`}>{student.status}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{student.department}</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>GPA</div>
          <div className={`gpa-badge ${getGPAClass(student.gpa)}`} style={{ fontSize: 22, padding: '4px 12px' }}>
            {student.gpa?.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {/* Personal Info */}
        <div className="card" style={{ padding: 16 }}>
          <div className="section-title">Personal Information</div>
          <InfoRow icon={Mail} label="Email" value={student.email} />
          <InfoRow icon={Phone} label="Phone" value={student.phone} />
          <InfoRow icon={Calendar} label="Date of Birth" value={formatDate(student.dateOfBirth)} />
          <InfoRow icon={MapPin} label="Address" value={[student.address?.city, student.address?.state].filter(Boolean).join(', ')} />
        </div>

        {/* Academic Info */}
        <div className="card" style={{ padding: 16 }}>
          <div className="section-title">Academic Information</div>
          <InfoRow icon={BookOpen} label="Department" value={student.department} />
          <InfoRow icon={Star} label="Year" value={`Year ${student.yearOfStudy}`} />
          <InfoRow icon={Calendar} label="Enrolled On" value={formatDate(student.enrollmentDate)} />
          <InfoRow icon={Star} label="Gender" value={student.gender} />
        </div>
      </div>

      {/* Enrollment History */}
      <div className="card" style={{ padding: 16 }}>
        <div className="section-title">Enrollment History ({enrollments.length})</div>
        {loadingEnroll ? (
          <div className="loading-container" style={{ padding: 30 }}><div className="loading-spinner" /></div>
        ) : enrollments.length === 0 ? (
          <div className="empty-state" style={{ padding: 30 }}>
            <div className="empty-state-icon">📚</div>
            <p>No enrollments found for this student.</p>
          </div>
        ) : (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Semester</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Enrolled On</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e._id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{e.course?.courseName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{e.course?.courseCode}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{e.course?.semester}</td>
                  <td>
                    {e.grade?.letter ? (
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {e.grade.letter} ({e.grade.numerical ?? '—'})
                      </span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td><span className={`badge ${getStatusBadge(e.status)}`}>{e.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(e.enrollmentDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
