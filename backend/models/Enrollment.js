/**
 * Enrollment Model - Demonstrates Composition (C++ OOP Principle)
 *
 * Enrollment is a relationship entity linking Student and Course.
 * In C++ terms: this is a "has-a" relationship (composition).
 * A student HAS enrollments; a course HAS enrolled students.
 *
 * CRUD operations on this model:
 *   C - Enroll a student in a course
 *   R - View all enrollments, filter by student/course
 *   U - Update grade/status
 *   D - Drop/remove an enrollment
 */

const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required']
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required']
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    // Grade tracking (structured file-handling analog: structured records)
    grade: {
      // Letter grade (A, B, C, D, F)
      letter: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'I', 'W'],
        default: null
      },
      // Numerical grade (0-100)
      numerical: {
        type: Number,
        min: 0,
        max: 100,
        default: null
      },
      // Grade points (10-point scale)
      points: {
        type: Number,
        min: 0,
        max: 10,
        default: null
      }
    },
    // Attendance tracking
    attendance: {
      totalClasses: { type: Number, default: 0 },
      attendedClasses: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ['Enrolled', 'Completed', 'Dropped', 'Failed', 'Incomplete'],
      default: 'Enrolled'
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [200, 'Remarks cannot exceed 200 characters'],
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── Compound Unique Index (prevent duplicate enrollment) ─────────────────────
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// ─── Virtual: Attendance percentage ──────────────────────────────────────────
enrollmentSchema.virtual('attendancePercent').get(function () {
  if (!this.attendance.totalClasses || this.attendance.totalClasses === 0) return 0;
  return Math.round((this.attendance.attendedClasses / this.attendance.totalClasses) * 100);
});

// ─── Pre-save hook: auto-calculate grade points from numerical ────────────────
enrollmentSchema.pre('save', function (next) {
  if (this.grade.numerical !== null && this.grade.numerical !== undefined) {
    const num = this.grade.numerical;
    // Convert 0-100 scale to 10-point GPA scale
    if (num >= 95) { this.grade.points = 10.0; this.grade.letter = 'A+'; }
    else if (num >= 90) { this.grade.points = 9.0; this.grade.letter = 'A'; }
    else if (num >= 85) { this.grade.points = 8.5; this.grade.letter = 'A-'; }
    else if (num >= 80) { this.grade.points = 8.0; this.grade.letter = 'B+'; }
    else if (num >= 75) { this.grade.points = 7.5; this.grade.letter = 'B'; }
    else if (num >= 70) { this.grade.points = 7.0; this.grade.letter = 'B-'; }
    else if (num >= 65) { this.grade.points = 6.5; this.grade.letter = 'C+'; }
    else if (num >= 60) { this.grade.points = 6.0; this.grade.letter = 'C'; }
    else if (num >= 55) { this.grade.points = 5.5; this.grade.letter = 'C-'; }
    else if (num >= 50) { this.grade.points = 5.0; this.grade.letter = 'D'; }
    else { this.grade.points = 0.0; this.grade.letter = 'F'; }
  }
  next();
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
