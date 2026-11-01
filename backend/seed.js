/**
 * Database Seed Script
 *
 * Populates MongoDB with sample students, courses, and enrollments.
 * Run with: node seed.js
 *
 * Demonstrates structural file-handling and OOP-based data modeling.
 */

require('dotenv').config()
const mongoose = require('mongoose')
const Student = require('./models/Student')
const Course = require('./models/Course')
const Enrollment = require('./models/Enrollment')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studentmanagement'

const sampleStudents = [
  { studentId: 'STU0001', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.sharma@edu.com', phone: '+91 9876543210', dateOfBirth: '2003-05-15', gender: 'Male', department: 'Computer Science', yearOfStudy: 3, status: 'Active', address: { city: 'Mumbai', state: 'Maharashtra', country: 'India' } },
  { studentId: 'STU0002', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@edu.com', phone: '+91 9876543211', dateOfBirth: '2002-08-22', gender: 'Female', department: 'Mathematics', yearOfStudy: 4, status: 'Active', address: { city: 'Ahmedabad', state: 'Gujarat', country: 'India' } },
  { studentId: 'STU0003', firstName: 'Rahul', lastName: 'Verma', email: 'rahul.verma@edu.com', phone: '+91 9876543212', dateOfBirth: '2004-01-10', gender: 'Male', department: 'Physics', yearOfStudy: 2, status: 'Active', address: { city: 'Delhi', state: 'Delhi', country: 'India' } },
  { studentId: 'STU0004', firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.reddy@edu.com', phone: '+91 9876543213', dateOfBirth: '2003-11-30', gender: 'Female', department: 'Engineering', yearOfStudy: 3, status: 'Active', address: { city: 'Hyderabad', state: 'Telangana', country: 'India' } },
  { studentId: 'STU0005', firstName: 'Karan', lastName: 'Mehta', email: 'karan.mehta@edu.com', phone: '+91 9876543214', dateOfBirth: '2002-03-18', gender: 'Male', department: 'Business', yearOfStudy: 4, status: 'Active', address: { city: 'Pune', state: 'Maharashtra', country: 'India' } },
  { studentId: 'STU0006', firstName: 'Ananya', lastName: 'Singh', email: 'ananya.singh@edu.com', dateOfBirth: '2004-07-25', gender: 'Female', department: 'Computer Science', yearOfStudy: 1, status: 'Active', address: { city: 'Bangalore', state: 'Karnataka', country: 'India' } },
  { studentId: 'STU0007', firstName: 'Vikram', lastName: 'Nair', email: 'vikram.nair@edu.com', dateOfBirth: '2001-12-05', gender: 'Male', department: 'Economics', yearOfStudy: 5, status: 'Graduated', address: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' } },
]

const sampleCourses = [
  { courseCode: 'CS101', courseName: 'Introduction to Programming', department: 'Computer Science', credits: 4, instructor: { name: 'Dr. Rajesh Kumar', email: 'r.kumar@faculty.edu' }, maxCapacity: 80, semester: 'Fall 2025', status: 'Active', schedule: { days: ['Monday', 'Wednesday', 'Friday'], startTime: '09:00', endTime: '10:00', room: 'CS Block, Room 101' } },
  { courseCode: 'CS201', courseName: 'Data Structures & Algorithms', department: 'Computer Science', credits: 4, instructor: { name: 'Dr. Meera Joshi', email: 'm.joshi@faculty.edu' }, maxCapacity: 60, semester: 'Fall 2025', status: 'Active', schedule: { days: ['Tuesday', 'Thursday'], startTime: '10:00', endTime: '11:30', room: 'CS Block, Room 201' } },
  { courseCode: 'MATH101', courseName: 'Calculus I', department: 'Mathematics', credits: 3, instructor: { name: 'Prof. Suresh Iyer', email: 's.iyer@faculty.edu' }, maxCapacity: 100, semester: 'Fall 2025', status: 'Active', schedule: { days: ['Monday', 'Wednesday'], startTime: '11:00', endTime: '12:00', room: 'Math Block, Room A1' } },
  { courseCode: 'PHY101', courseName: 'Physics Fundamentals', department: 'Physics', credits: 3, instructor: { name: 'Dr. Anita Roy', email: 'a.roy@faculty.edu' }, maxCapacity: 75, semester: 'Fall 2025', status: 'Active', schedule: { days: ['Tuesday', 'Thursday', 'Saturday'], startTime: '08:00', endTime: '09:00', room: 'Science Block, Lab 1' } },
  { courseCode: 'BUS201', courseName: 'Business Management', department: 'Business', credits: 3, instructor: { name: 'Prof. Deepak Gupta', email: 'd.gupta@faculty.edu' }, maxCapacity: 90, semester: 'Fall 2025', status: 'Active', schedule: { days: ['Monday', 'Friday'], startTime: '14:00', endTime: '15:30', room: 'Management Block, Room 5' } },
]

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    await Student.deleteMany({})
    await Course.deleteMany({})
    await Enrollment.deleteMany({})
    console.log('🧹 Cleared existing data')

    // Seed students
    const students = await Student.insertMany(sampleStudents)
    console.log(`👩‍🎓 Inserted ${students.length} students`)

    // Seed courses
    const courses = await Course.insertMany(sampleCourses)
    console.log(`📚 Inserted ${courses.length} courses`)

    // Create sample enrollments
    const enrollments = [
      { student: students[0]._id, course: courses[0]._id, status: 'Completed', grade: { numerical: 92 } },
      { student: students[0]._id, course: courses[1]._id, status: 'Enrolled', grade: { numerical: 85 } },
      { student: students[1]._id, course: courses[2]._id, status: 'Completed', grade: { numerical: 78 } },
      { student: students[2]._id, course: courses[3]._id, status: 'Enrolled', grade: { numerical: 88 } },
      { student: students[3]._id, course: courses[0]._id, status: 'Completed', grade: { numerical: 95 } },
      { student: students[4]._id, course: courses[4]._id, status: 'Enrolled', grade: { numerical: 72 } },
    ]

    for (const e of enrollments) {
      const enrollment = new Enrollment(e)
      await enrollment.save()
    }

    // Update course enrollment counts
    for (const course of courses) {
      const count = await Enrollment.countDocuments({ course: course._id })
      await Course.findByIdAndUpdate(course._id, { currentEnrollment: count })
    }

    console.log(`📋 Inserted ${enrollments.length} enrollments`)
    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`   Students: ${students.length}`)
    console.log(`   Courses:  ${courses.length}`)
    console.log(`   Enrollments: ${enrollments.length}`)
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Disconnected from MongoDB')
    process.exit(0)
  }
}

seed()
