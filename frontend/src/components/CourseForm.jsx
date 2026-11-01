import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { DEPARTMENTS, SEMESTERS, DAYS } from '../utils/helpers'

const initial = {
  courseCode: '', courseName: '', description: '', department: '',
  credits: 3, instructor: { name: '', email: '' },
  schedule: { days: [], startTime: '09:00', endTime: '10:00', room: '' },
  maxCapacity: 60, semester: '', status: 'Active'
}

export default function CourseForm({ initial: init, onSave, onCancel }) {
  const [form, setForm] = useState(init ? { ...initial, ...init, instructor: { ...initial.instructor, ...(init.instructor || {}) }, schedule: { ...initial.schedule, ...(init.schedule || {}) } } : initial)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('basic')

  const set = (field, value) => { setForm((f) => ({ ...f, [field]: value })); if (errors[field]) setErrors((e) => ({ ...e, [field]: '' })) }
  const setInstr = (field, value) => setForm((f) => ({ ...f, instructor: { ...f.instructor, [field]: value } }))
  const setSched = (field, value) => setForm((f) => ({ ...f, schedule: { ...f.schedule, [field]: value } }))
  const toggleDay = (day) => {
    const days = form.schedule.days.includes(day) ? form.schedule.days.filter((d) => d !== day) : [...form.schedule.days, day]
    setSched('days', days)
  }

  const validate = () => {
    const e = {}
    if (!form.courseCode.trim()) e.courseCode = 'Course code is required'
    if (!form.courseName.trim()) e.courseName = 'Course name is required'
    if (!form.department) e.department = 'Department is required'
    if (!form.instructor.name.trim()) e.instructorName = 'Instructor name is required'
    if (!form.semester) e.semester = 'Semester is required'
    if (!form.maxCapacity || form.maxCapacity < 1) e.maxCapacity = 'Max capacity must be at least 1'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try { await onSave(form, init?._id) } catch { } finally { setSaving(false) }
  }

  const Field = ({ label, id, required, error, hint, children }) => (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <label className="form-label" htmlFor={id}>{label}{required && <span className="form-required">*</span>}</label>
      {children}
      {error && <div className="form-error">{error}</div>}
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <div className="tabs" style={{ marginBottom: 24 }}>
        {[['basic', 'Basic Info'], ['instructor', 'Instructor & Schedule'], ['capacity', 'Capacity & Semester']].map(([key, label]) => (
          <button key={key} type="button" className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'basic' && (
        <div>
          <div className="form-row">
            <Field label="Course Code" id="courseCode" required error={errors.courseCode} hint="Format: CS101, MATH201">
              <input id="courseCode" className="form-input" placeholder="CS101" value={form.courseCode} onChange={(e) => set('courseCode', e.target.value.toUpperCase())} />
            </Field>
            <Field label="Credits" id="credits" required>
              <select id="credits" className="form-select" value={form.credits} onChange={(e) => set('credits', parseInt(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>{c} Credit{c > 1 ? 's' : ''}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Course Name" id="courseName" required error={errors.courseName}>
            <input id="courseName" className="form-input" placeholder="Introduction to Computer Science" value={form.courseName} onChange={(e) => set('courseName', e.target.value)} />
          </Field>
          <Field label="Department" id="dept" required error={errors.department}>
            <select id="dept" className="form-select" value={form.department} onChange={(e) => set('department', e.target.value)}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Description" id="desc">
            <textarea id="desc" className="form-textarea" placeholder="Brief course description..." value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <Field label="Status" id="cstatus">
            <select id="cstatus" className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {['Active', 'Inactive', 'Completed', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
      )}

      {tab === 'instructor' && (
        <div>
          <Field label="Instructor Name" id="instrName" required error={errors.instructorName}>
            <input id="instrName" className="form-input" placeholder="Dr. John Smith" value={form.instructor.name} onChange={(e) => setInstr('name', e.target.value)} />
          </Field>
          <Field label="Instructor Email" id="instrEmail">
            <input id="instrEmail" type="email" className="form-input" placeholder="john.smith@university.edu" value={form.instructor.email} onChange={(e) => setInstr('email', e.target.value)} />
          </Field>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Class Days</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DAYS.map((day) => (
                <button key={day} type="button"
                  onClick={() => toggleDay(day)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    border: '1px solid',
                    background: form.schedule.days.includes(day) ? 'var(--gradient-primary)' : 'transparent',
                    borderColor: form.schedule.days.includes(day) ? 'transparent' : 'var(--border-glass)',
                    color: form.schedule.days.includes(day) ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.2s'
                  }}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <Field label="Start Time" id="startTime">
              <input id="startTime" type="time" className="form-input" value={form.schedule.startTime} onChange={(e) => setSched('startTime', e.target.value)} />
            </Field>
            <Field label="End Time" id="endTime">
              <input id="endTime" type="time" className="form-input" value={form.schedule.endTime} onChange={(e) => setSched('endTime', e.target.value)} />
            </Field>
          </div>
          <Field label="Room / Location" id="room">
            <input id="room" className="form-input" placeholder="Room 201, Block A" value={form.schedule.room} onChange={(e) => setSched('room', e.target.value)} />
          </Field>
        </div>
      )}

      {tab === 'capacity' && (
        <div>
          <Field label="Semester" id="semester" required error={errors.semester}>
            <select id="semester" className="form-select" value={form.semester} onChange={(e) => set('semester', e.target.value)}>
              <option value="">Select semester</option>
              {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Maximum Capacity" id="maxCapacity" required error={errors.maxCapacity} hint="Maximum number of students that can enroll">
            <input id="maxCapacity" type="number" className="form-input" min={1} max={300} value={form.maxCapacity} onChange={(e) => set('maxCapacity', parseInt(e.target.value))} />
          </Field>
          {init && (
            <div className="card" style={{ background: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Current Enrollment</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>{init.currentEnrollment}/{init.maxCapacity}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${init.enrollmentPercent}%` }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{init.availableSeats} seats available</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-glass)' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}><X size={16} /> Cancel</button>
        <button type="submit" id="save-course-btn" className="btn btn-primary" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : (init ? 'Update Course' : 'Create Course')}</button>
      </div>
    </form>
  )
}
