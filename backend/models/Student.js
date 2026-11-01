/**
 * Student Model - Analogous to a C++ Class
 *
 * Encapsulates all student-related data and behavior.
 * Demonstrates:
 *   - Data encapsulation (private fields via schema validation)
 *   - Object construction (Mongoose model creation)
 *   - Method definitions (virtual fields, instance methods)
 *   - Data integrity enforcement (validators = C++ assertions)
 */

const mongoose = require('mongoose');

// Schema = C++ class definition (blueprint for Student objects)
const studentSchema = new mongoose.Schema(
  {
    // Student ID (unique identifier - like a C++ object's memory address)
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^STU\d{4,}$/, 'Student ID must follow format STU0001']
    },
    // Personal Information (encapsulated data members)
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      required: [true, 'Gender is required']
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
    yearOfStudy: {
      type: Number,
      required: [true, 'Year of study is required'],
      min: [1, 'Year must be between 1 and 6'],
      max: [6, 'Year must be between 1 and 6']
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' }
    },
    // GPA stored separately, calculated from enrollments
    gpa: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 10
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Graduated', 'Suspended'],
      default: 'Active'
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true, // Adds createdAt, updatedAt (like C++ constructors tracking lifecycle)
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─── Virtual Properties (Computed fields - like C++ getter methods) ────────────
studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

// ─── Indexes for performance (like C++ sorted data structures) ────────────────
// Note: studentId and email indexes are auto-created by unique:true above
studentSchema.index({ department: 1 });
studentSchema.index({ lastName: 1, firstName: 1 });

// ─── Instance Methods (like C++ member functions) ─────────────────────────────
studentSchema.methods.toSummary = function () {
  return {
    id: this._id,
    studentId: this.studentId,
    fullName: this.fullName,
    department: this.department,
    gpa: this.gpa,
    status: this.status
  };
};

// Model creation = C++ class instantiation
const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
