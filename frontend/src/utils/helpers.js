// Shared helper utilities
export const DEPARTMENTS = [
  'Computer Science', 'Mathematics', 'Physics', 'Chemistry',
  'Biology', 'Engineering', 'Business', 'Arts', 'Literature', 'Economics'
]

export const SEMESTERS = [
  'Spring 2025', 'Summer 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026'
]

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const getGPAClass = (gpa) => {
  if (gpa >= 7.5) return 'gpa-high'
  if (gpa >= 5.0) return 'gpa-mid'
  return 'gpa-low'
}

export const getStatusBadge = (status) => {
  const map = {
    Active: 'badge-active',
    Inactive: 'badge-inactive',
    Graduated: 'badge-graduated',
    Suspended: 'badge-suspended',
    Enrolled: 'badge-enrolled',
    Completed: 'badge-completed',
    Dropped: 'badge-dropped',
    Failed: 'badge-failed',
    Cancelled: 'badge-inactive',
  }
  return map[status] || 'badge-inactive'
}

export const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

export const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export const GRADE_LETTERS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I', 'W']

export const AVATAR_COLORS = [
  'linear-gradient(135deg, #4f8ef7, #8b5cf6)',
  'linear-gradient(135deg, #14b8a6, #4f8ef7)',
  'linear-gradient(135deg, #f59e0b, #f43f5e)',
  'linear-gradient(135deg, #10b981, #4f8ef7)',
  'linear-gradient(135deg, #8b5cf6, #f43f5e)',
]

export const getAvatarColor = (name) => {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}
