import { useState } from 'react'
import { Save, X } from 'lucide-react'
import { DEPARTMENTS } from '../utils/helpers'

const initialState = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', gender: '', department: '', yearOfStudy: '',
  address: { street: '', city: '', state: '', postalCode: '', country: 'India' },
  status: 'Active'
}

/**
 * StudentForm - Encapsulates create/edit form logic
 * Analogous to a C++ class that manages its own state internally
 */
export default function StudentForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? {
    ...initialState,
    ...initial,
    dateOfBirth: initial.dateOfBirth ? initial.dateOfBirth.split('T')[0] : '',
    address: { ...initialState.address, ...(initial.address || {}) }
  } : initialState)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('basic')

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  const setAddr = (field, value) => {
    setForm((f) => ({ ...f, address: { ...f.address, [field]: value } }))
  }

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format'
    if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required'
    if (!form.gender) e.gender = 'Gender is required'
    if (!form.department) e.department = 'Department is required'
    if (!form.yearOfStudy) e.yearOfStudy = 'Year of study is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await onSave(form, initial?._id)
    } catch {
      // Error handled by parent
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, id, required, error, children }) => (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <label className="form-label" htmlFor={id}>
        {label}{required && <span className="form-required">*</span>}
      </label>
      {children}
      {error && <div className="form-error">{error}</div>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      {/* Tab Navigation */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {[['basic', 'Basic Info'], ['contact', 'Contact & Address'], ['academic', 'Academic Info']].map(([key, label]) => (
          <button key={key} type="button" className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* Basic Info Tab */}
      {tab === 'basic' && (
        <div>
          <div className="form-row">
            <Field label="First Name" id="firstName" required error={errors.firstName}>
              <input id="firstName" className="form-input" placeholder="John" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
            </Field>
            <Field label="Last Name" id="lastName" required error={errors.lastName}>
              <input id="lastName" className="form-input" placeholder="Doe" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
            </Field>
          </div>
          <div className="form-row">
            <Field label="Date of Birth" id="dateOfBirth" required error={errors.dateOfBirth}>
              <input id="dateOfBirth" type="date" className="form-input" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
            </Field>
            <Field label="Gender" id="gender" required error={errors.gender}>
              <select id="gender" className="form-select" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="">Select gender</option>
                {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Status" id="status">
            <select id="status" className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {['Active', 'Inactive', 'Graduated', 'Suspended'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
      )}

      {/* Contact Tab */}
      {tab === 'contact' && (
        <div>
          <Field label="Email Address" id="email" required error={errors.email}>
            <input id="email" type="email" className="form-input" placeholder="john@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Phone Number" id="phone">
            <input id="phone" className="form-input" placeholder="+91 9876543210" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <div className="form-row">
            <Field label="Street Address" id="street">
              <input id="street" className="form-input" placeholder="123 Main St" value={form.address.street} onChange={(e) => setAddr('street', e.target.value)} />
            </Field>
            <Field label="City" id="city">
              <input id="city" className="form-input" placeholder="Mumbai" value={form.address.city} onChange={(e) => setAddr('city', e.target.value)} />
            </Field>
          </div>
          <div className="form-row">
            <Field label="State" id="state">
              <input id="state" className="form-input" placeholder="Maharashtra" value={form.address.state} onChange={(e) => setAddr('state', e.target.value)} />
            </Field>
            <Field label="Postal Code" id="postalCode">
              <input id="postalCode" className="form-input" placeholder="400001" value={form.address.postalCode} onChange={(e) => setAddr('postalCode', e.target.value)} />
            </Field>
          </div>
        </div>
      )}

      {/* Academic Tab */}
      {tab === 'academic' && (
        <div>
          <div className="form-row">
            <Field label="Department" id="department" required error={errors.department}>
              <select id="department" className="form-select" value={form.department} onChange={(e) => set('department', e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Year of Study" id="yearOfStudy" required error={errors.yearOfStudy}>
              <select id="yearOfStudy" className="form-select" value={form.yearOfStudy} onChange={(e) => set('yearOfStudy', parseInt(e.target.value))}>
                <option value="">Select year</option>
                {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Enrollment Date" id="enrollmentDate">
            <input id="enrollmentDate" type="date" className="form-input"
              value={form.enrollmentDate ? form.enrollmentDate.split('T')[0] : ''}
              onChange={(e) => set('enrollmentDate', e.target.value)} />
          </Field>
          {initial && (
            <div className="card" style={{ background: 'rgba(79,142,247,0.05)', borderColor: 'rgba(79,142,247,0.15)' }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Current GPA:</strong>{' '}
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>{initial.gpa?.toFixed(2)}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>(Auto-calculated from enrollments)</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-glass)' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          <X size={16} /> Cancel
        </button>
        <button type="submit" id="save-student-btn" className="btn btn-primary" disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : (initial ? 'Update Student' : 'Create Student')}
        </button>
      </div>
    </form>
  )
}
