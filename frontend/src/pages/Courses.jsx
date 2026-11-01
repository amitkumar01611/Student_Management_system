import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { courseAPI } from '../utils/api'
import { DEPARTMENTS, SEMESTERS, getStatusBadge, formatDate } from '../utils/helpers'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import CourseForm from '../components/CourseForm'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ department: '', semester: '', status: '' })
  const [showForm, setShowForm] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [selected, setSelected] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchCourses = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await courseAPI.getAll({ page, limit: pagination.limit, search, ...filters })
      setCourses(res.data)
      setPagination((prev) => ({ ...prev, ...res.pagination }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, filters, pagination.limit])

  useEffect(() => {
    const t = setTimeout(() => fetchCourses(1), 300)
    return () => clearTimeout(t)
  }, [search, filters])

  const handleSave = async (formData, editId) => {
    try {
      if (editId) {
        await courseAPI.update(editId, formData)
        toast.success('Course updated successfully!')
      } else {
        await courseAPI.create(formData)
        toast.success('Course created successfully!')
      }
      setShowForm(false); setSelected(null)
      fetchCourses(pagination.page)
    } catch (err) { toast.error(err.message); throw err }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await courseAPI.delete(selected._id)
      toast.success(`Course "${selected.courseName}" deleted.`)
      setShowDelete(false); setSelected(null)
      fetchCourses(pagination.page)
    } catch (err) { toast.error(err.message) }
    finally { setDeleteLoading(false) }
  }

  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Courses</h1>
          <p>Manage academic course catalog — {pagination.total} total</p>
        </div>
        <div className="page-actions">
          <button id="add-course-btn" className="btn btn-primary" onClick={() => { setSelected(null); setShowForm(true) }}>
            <Plus size={16} /> Add Course
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="table-toolbar">
          <div className="search-wrapper">
            <Search className="search-icon" size={15} />
            <input id="course-search" className="form-input search-input" placeholder="Search code, name, instructor..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 180 }} value={filters.department} onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="form-select" style={{ width: 160 }} value={filters.semester} onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value }))}>
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 130 }} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">All Status</option>
            {['Active', 'Inactive', 'Completed', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="table-wrapper">
          {loading ? (
            <div className="loading-container"><div className="loading-spinner" /><p>Loading courses...</p></div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>No courses found</h3>
              <p>{search ? 'Try a different search term.' : 'Add your first course to get started.'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Department</th>
                  <th>Credits</th>
                  <th>Instructor</th>
                  <th>Enrollment</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.courseName}</div>
                      <div style={{ fontSize: 11, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{c.courseCode}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.department}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)', padding: '2px 8px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>{c.credits}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.instructor?.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill" style={{ width: `${c.enrollmentPercent}%` }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.currentEnrollment}/{c.maxCapacity}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.semester}</td>
                    <td><span className={`badge ${getStatusBadge(c.status)}`}>{c.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button id={`edit-course-${c._id}`} className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => { setSelected(c); setShowForm(true) }}>
                          <Edit2 size={15} />
                        </button>
                        <button id={`delete-course-${c._id}`} className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => { setSelected(c); setShowDelete(true) }}>
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
          <span className="pagination-info">
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className="pagination">
            <button className="page-btn" disabled={pagination.page <= 1} onClick={() => fetchCourses(pagination.page - 1)}><ChevronLeft size={14} /></button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn ${pagination.page === p ? 'active' : ''}`} onClick={() => fetchCourses(p)}>{p}</button>
            ))}
            <button className="page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchCourses(pagination.page + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelected(null) }} title={selected ? 'Edit Course' : 'Add New Course'} size="modal-lg">
        <CourseForm initial={selected} onSave={handleSave} onCancel={() => { setShowForm(false); setSelected(null) }} />
      </Modal>

      <ConfirmDialog isOpen={showDelete} onClose={() => { setShowDelete(false); setSelected(null) }} onConfirm={handleDelete} loading={deleteLoading}
        title="Delete Course?" message={`This will delete "${selected?.courseName}". Cannot delete if students are actively enrolled.`} />
    </div>
  )
}
