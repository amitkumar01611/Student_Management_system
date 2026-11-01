import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { studentAPI } from '../utils/api'
import {
  DEPARTMENTS, getStatusBadge, formatDate,
  getInitials, getAvatarColor, getGPAClass
} from '../utils/helpers'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import StudentForm from '../components/StudentForm'
import StudentDetail from '../components/StudentDetail'

export default function Students() {
  const [students, setStudents] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ department: '', status: '', yearOfStudy: '' })

  // Modal states
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [selected, setSelected] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await studentAPI.getAll({
        page, limit: pagination.limit, search,
        ...filters
      })
      setStudents(res.data)
      setPagination((prev) => ({ ...prev, ...res.pagination }))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, filters, pagination.limit])

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(1), 300)
    return () => clearTimeout(timer)
  }, [search, filters])

  const handleSave = async (formData, editId) => {
    try {
      if (editId) {
        await studentAPI.update(editId, formData)
        toast.success('Student updated successfully!')
      } else {
        await studentAPI.create(formData)
        toast.success('Student created successfully!')
      }
      setShowForm(false)
      setSelected(null)
      fetchStudents(pagination.page)
    } catch (err) {
      toast.error(err.message)
      throw err
    }
  }

  const handleDelete = async () => {
    if (!selected) return
    setDeleteLoading(true)
    try {
      await studentAPI.delete(selected._id)
      toast.success(`${selected.firstName} ${selected.lastName} deleted.`)
      setShowDelete(false)
      setSelected(null)
      fetchStudents(pagination.page)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const openEdit = (student) => { setSelected(student); setShowForm(true) }
  const openView = (student) => { setSelected(student); setShowDetail(true) }
  const openDelete = (student) => { setSelected(student); setShowDelete(true) }

  return (
    <div style={{ animation: 'slideUp 0.4s ease' }}>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Students</h1>
          <p>Manage all student records — {pagination.total} total</p>
        </div>
        <div className="page-actions">
          <button id="add-student-btn" className="btn btn-primary" onClick={() => { setSelected(null); setShowForm(true) }}>
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="search-wrapper">
            <Search className="search-icon" size={15} />
            <input
              id="student-search"
              className="form-input search-input"
              placeholder="Search name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-select"
            style={{ width: 180 }}
            value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            className="form-select"
            style={{ width: 140 }}
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Status</option>
            {['Active', 'Inactive', 'Graduated', 'Suspended'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ width: 120 }}
            value={filters.yearOfStudy}
            onChange={(e) => setFilters((f) => ({ ...f, yearOfStudy: e.target.value }))}
          >
            <option value="">All Years</option>
            {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>

        {/* Table Body */}
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-container"><div className="loading-spinner" /><p>Loading students...</p></div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👩‍🎓</div>
              <h3>No students found</h3>
              <p>{search || filters.department || filters.status ? 'Try adjusting your filters.' : 'Click "Add Student" to create the first record.'}</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student ID</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>GPA</th>
                  <th>Status</th>
                  <th>Enrolled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
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
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-blue)' }}>{s.studentId}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.department}</td>
                    <td style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>{s.yearOfStudy}</td>
                    <td><span className={`gpa-badge ${getGPAClass(s.gpa)}`}>{s.gpa?.toFixed(1)}</span></td>
                    <td><span className={`badge ${getStatusBadge(s.status)}`}>{s.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatDate(s.enrollmentDate)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button id={`view-student-${s._id}`} className="btn btn-ghost btn-icon btn-sm" title="View Details" onClick={() => openView(s)}>
                          <Eye size={15} />
                        </button>
                        <button id={`edit-student-${s._id}`} className="btn btn-ghost btn-icon btn-sm" title="Edit Student" onClick={() => openEdit(s)}>
                          <Edit2 size={15} />
                        </button>
                        <button id={`delete-student-${s._id}`} className="btn btn-danger btn-icon btn-sm" title="Delete Student" onClick={() => openDelete(s)}>
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

        {/* Pagination Footer */}
        <div className="table-footer">
          <span className="pagination-info">
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </span>
          <div className="pagination">
            <button className="page-btn" disabled={pagination.page <= 1} onClick={() => fetchStudents(pagination.page - 1)}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const p = i + 1
              return (
                <button key={p} className={`page-btn ${pagination.page === p ? 'active' : ''}`} onClick={() => fetchStudents(p)}>{p}</button>
              )
            })}
            <button className="page-btn" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchStudents(pagination.page + 1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setSelected(null) }}
        title={selected ? 'Edit Student' : 'Add New Student'}
        size="modal-lg"
      >
        <StudentForm
          initial={selected}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setSelected(null) }}
        />
      </Modal>

      <Modal
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setSelected(null) }}
        title="Student Details"
        size="modal-lg"
      >
        {selected && <StudentDetail student={selected} />}
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => { setShowDelete(false); setSelected(null) }}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Student?"
        message={`This will permanently delete ${selected?.firstName} ${selected?.lastName} and all their enrollments.`}
      />
    </div>
  )
}
