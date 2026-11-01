/**
 * Course Model - Demonstrates Modular OOP Design
 *
 * Represents an academic course entity.
 * Each Course object encapsulates its own data and behavior.
 * In C++ terms: this is a separate class in its own translation unit.
 */

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{2,4}\d{3,4}$/, 'Course code must follow format like CS101']
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      minlength: [3, 'Course name must be at least 3 characters'],
      maxlength: [100, 'Course name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: [
        'Computer Science',
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'Engineering',
        'Business',
        'Arts',
        'Literature',
        'Economics'
      ]
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Minimum 1 credit'],
      max: [6, 'Maximum 6 credits']
    },
    instructor: {
      name: {
        type: String,
        required: [true, 'Instructor name is required'],
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    schedule: {
      days: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        default: []
      },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '10:00' },
      room: { type: String, trim: true }
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Max capacity is required'],
      min: [1, 'Must allow at least 1 student'],
      max: [300, 'Cannot exceed 300 students']
    },
    currentEnrollment: {
      type: Number,
      default: 0,
      min: 0
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
      enum: ['Spring 2025', 'Summer 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026']
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Completed', 'Cancelled'],
      default: 'Active'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── Virtual Properties ───────────────────────────────────────────────────────
courseSchema.virtual('availableSeats').get(function () {
  return this.maxCapacity - this.currentEnrollment;
});

courseSchema.virtual('isFull').get(function () {
  return this.currentEnrollment >= this.maxCapacity;
});

courseSchema.virtual('enrollmentPercent').get(function () {
  if (this.maxCapacity === 0) return 0;
  return Math.round((this.currentEnrollment / this.maxCapacity) * 100);
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Note: courseCode index is auto-created by unique:true above
courseSchema.index({ department: 1 });
courseSchema.index({ semester: 1 });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
