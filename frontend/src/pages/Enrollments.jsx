import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { enrollmentAPI, studentAPI, courseAPI } from '../utils/api'
import { getStatusBadge, formatDate, getInitials, getAvatarColor, GRADE_LETTERS } from '../utils/helpers'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '' })

  const [showEnroll, setShowEnroll] = useState(false)
  const [showGrade, setShowGrade] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [selected, setSelected] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Enroll form state
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [enrollForm, setEnrollForm] = useState({ studentId: '', courseId: '' })
  const [enrollSaving, setEnrollSaving] = useState(false)

  // Grade form state
  const [gradeForm, setGradeForm] = useState({ 'grade.numerical': '', status: 'Enrolled', remarks: '', 'attendance.totalClasses': '', 'attendance.attendedClasses': '' })
  const [gradeSaving, setGradeSaving] = useState(false)

  const fetchEnrollments = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await enrollmentAPI.getAll({ page, limit: pagination.limit, ...filters })
      setEnrollments(res.data)
      setPagination((prev) => ({ ...prev, ...res.pagination }))
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }, [filters, pagination.limit])

  useEffect(() => { fetchEnrollments(1) }, [filters])

  const loadDropdowns = async () => {
    try {
      const [s, c] = await Promise.all([
        studentAPI.getAll({ limit: 200, status: 'Active' }),
        courseAPI.getAll({ limit: 200, status: 'Active' })
      ])
      setStudents(s.data)
      setCourses(c.data)
    } catch { }
  }

  const openEnroll = () => { loadDropdowns(); setEnrollForm({ studentId: '', courseId: '' }); setShowEnroll(true) }
  const openGrade = (e) => {
    setSelected(e)
    setGradeForm({ 'grade.numerical': e.grade?.numerical ?? '', status: e.status, remarks: e.remarks || '', 'attendance.totalClasses': e.attendance?.totalClasses || '', 'attendance.attendedClasses': e.attendance?.attendedClasses || '' })
    setShowGrade(true)
  }

  const handleEnroll = async (ev) => {
    ev.preventDefault()
    if (!enrollForm.studentId || !enrollForm.courseId) { toast.error('Please select both a student and a course.'); return }
    setEnrollSaving(true)
    try {
      await enrollmentAPI.create(enrollForm)
      toast.success('Student enrolled successfully!')
      setShowEnroll(false)
      fetchEnrollments(1)
    } catch (err) { toast.error(err.message) }
    finally { setEnrollSaving(false) }
  }

  const handleGrade = async (ev) => {
    ev.preventDefault()
    setGradeSaving(true)
    try {
      const payload = {
        status: gradeForm.status,
        remarks: gradeForm.remarks,
        grade: { numerical: gradeForm['grade.numerical'] ? parseFloat(gradeForm['grade.numerical']) : null },
        attendance: {
          totalClasses: parseInt(gradeForm['attendance.totalClasses']) || 0,
          attendedClasses: parseInt(gradeForm['attendance.attendedClasses']) || 0
        }
      }
      await enrollmentAPI.update(selected._id, payload)
      toast.success('Grade updated & GPA recalculated!')
      setShowGrade(false); setSelected(null)
      fetchEnrollments(pagination.page)
    } catch (err) { toast.error(err.message) }
    finally { setGradeSaving(false) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await enrollmentAPI.delete(selected._id)
      toast.success('Enrollment dropped successfully.')
      setShowDelete(false); setSelected(null)
      fetchEnrollments(pagination.page)
    } catch (err) { toast.error(err.message) }
    finally { setDeleteLoading(false) }
  }

  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Enrollments</h1>
          <p>Manage student course enrollments and grades — {pagination.total} total</p>
        </div>
        <div className="page-actions">
          <button id="add-enrollment-btn" className="btn btn-primary" onClick={openEnroll}>
            <Plus size={16} /> Enroll Student
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <select className="form-select" style={{ width: 160 }} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {['Enrolled', 'Completed', 'Dropped', 'Failed', 'Incomplete'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-container"><div className="loading-spinner" /><p>Loading enrollments...</p></div>
          ) : enrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No enrollments found</h3>
              <p>Click "Enroll Student" to add the first enrollment.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Grade</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  <th>Enrolled On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <div className="student-cell">
                        <div className="avatar avatar-sm" style={{ background: getAvatarColor(e.student?.firstName) }}>
                          {getInitials(e.student?.firstName, e.student?.lastName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{e.student?.firstName} {e.student?.lastName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{e.student?.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{e.course?.courseName}</div>
                      <div style={{ fontSize: 11, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>{e.course?.courseCode}</div>
                    </td>
                    <td>
                      {e.grade?.letter ? (
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: 'var(--accent-blue)' }}>{e.grade.letter}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 6 }}>({e.grade.numerical}%)</span>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Pending</span>}
                    </td>
                    <td>
                      {e.attendance?.totalClasses > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 50 }}>
                            <div className="progress-fill" style={{ width: `${e.attendancePercent}%` }} />
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.attendancePercent}%</span>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                    </td>
                    <td><span className={`badge ${getStatusBadge(e.status)}`}>{e.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(e.enrollmentDate)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button id={`grade-enrollment-${e._id}`} className="btn btn-ghost btn-icon btn-sm" title="Update Grade" onClick={() => openGrade(e)}>
                          <Edit2 size={15} />
                        </button>
                        <button id={`drop-enrollment-${e._id}`} className="btn btn-danger btn-icon btn-sm" title="Drop Enrollment" onClick={() => { setSelected(e); setShowDelete(true) }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="table-footer">
          <span className="pagination-info">Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span>
          <div className="pagination">
            <button className="page-btn" disabled={pagination.page <= 1} onClick={() => fetchEnrollments(pagination.page - 1)}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn ${pagination.page === p ? 'active' : ''}`} onClick={() => fetchEnrollments(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchEnrollments(pagination.page + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Enroll Modal */}
      <Modal isOpen={showEnroll} onClose={() => setShowEnroll(false)} title="Enroll Student in Course" size="modal-sm"
        footer={<><button className="btn btn-secondary" onClick={() => setShowEnroll(false)}>Cancel</button><button className="btn btn-primary" onClick={handleEnroll} disabled={enrollSaving}>{enrollSaving ? 'Enrolling...' : 'Enroll Student'}</button></>}>
        <form onSubmit={handleEnroll}>
          <div className="form-group">
            <label className="form-label">Student<span className="form-required">*</span></label>
            <select id="enroll-student" className="form-select" value={enrollForm.studentId} onChange={(e) => setEnrollForm((f) => ({ ...f, studentId: e.target.value }))}>
              <option value="">— Select Active Student —</option>
              {students.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentId})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Course<span className="form-required">*</span></label>
            <select id="enroll-course" className="form-select" value={enrollForm.courseId} onChange={(e) => setEnrollForm((f) => ({ ...f, courseId: e.target.value }))}>
              <option value="">— Select Course —</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.courseCode} — {c.courseName} ({c.availableSeats} seats left)</option>)}
            </select>
          </div>
        </form>
      </Modal>

      {/* Grade Modal */}
      <Modal isOpen={showGrade} onClose={() => { setShowGrade(false); setSelected(null) }} title="Update Grade & Attendance"
        footer={<><button className="btn btn-secondary" onClick={() => setShowGrade(false)}>Cancel</button><button className="btn btn-primary" onClick={handleGrade} disabled={gradeSaving}>{gradeSaving ? 'Saving...' : 'Save Grade'}</button></>}>
        <form onSubmit={handleGrade}>
          {selected && (
            <div style={{ marginBottom: 16, padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-glass)', fontSize: 13 }}>
              <strong>{selected.student?.firstName} {selected.student?.lastName}</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>→ {selected.course?.courseName}</span>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Numerical Grade (0–100)</label>
              <input id="grade-numerical" type="number" className="form-input" min={0} max={100} placeholder="85" value={gradeForm['grade.numerical']} onChange={(e) => setGradeForm((f) => ({ ...f, 'grade.numerical': e.target.value }))} />
              <div className="form-hint">Letter grade & GPA points auto-calculated</div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select id="grade-status" className="form-select" value={gradeForm.status} onChange={(e) => setGradeForm((f) => ({ ...f, status: e.target.value }))}>
                {['Enrolled', 'Completed', 'Dropped', 'Failed', 'Incomplete'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Total Classes</label>
              <input id="total-classes" type="number" className="form-input" min={0} placeholder="40" value={gradeForm['attendance.totalClasses']} onChange={(e) => setGradeForm((f) => ({ ...f, 'attendance.totalClasses': e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Classes Attended</label>
              <input id="attended-classes" type="number" className="form-input" min={0} placeholder="36" value={gradeForm['attendance.attendedClasses']} onChange={(e) => setGradeForm((f) => ({ ...f, 'attendance.attendedClasses': e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Remarks</label>
            <textarea id="grade-remarks" className="form-textarea" placeholder="Optional notes..." value={gradeForm.remarks} onChange={(e) => setGradeForm((f) => ({ ...f, remarks: e.target.value }))} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showDelete} onClose={() => { setShowDelete(false); setSelected(null) }} onConfirm={handleDelete} loading={deleteLoading}
        title="Drop Enrollment?" message={`This will drop ${selected?.student?.firstName} ${selected?.student?.lastName} from ${selected?.course?.courseName}.`} />
    </div>
  )
}
