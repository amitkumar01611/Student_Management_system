/**
 * Enrollment Controller - CRUD for Student-Course Relationships
 *
 * Demonstrates composition and bidirectional data integrity.
 * Enrolling a student updates both Enrollment and Course models.
 */

const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Course = require('../models/Course');
const mongoose = require('mongoose');

// ─── Helper: Recalculate and update a student's GPA ──────────────────────────
const recalculateStudentGPA = async (studentId) => {
  const completedEnrollments = await Enrollment.find({
    student: studentId,
    status: { $in: ['Completed', 'Enrolled'] },
    'grade.points': { $ne: null }
  });

  if (completedEnrollments.length === 0) {
    await Student.findByIdAndUpdate(studentId, { gpa: 0 });
    return 0;
  }

  // Fetch course credits for weighted GPA
  const courseIds = completedEnrollments.map((e) => e.course);
  const courses = await Course.find({ _id: { $in: courseIds } });
  const courseMap = {};
  courses.forEach((c) => { courseMap[c._id.toString()] = c.credits; });

  let totalPoints = 0;
  let totalCredits = 0;
  completedEnrollments.forEach((e) => {
    const credits = courseMap[e.course.toString()] || 3;
    totalPoints += e.grade.points * credits;
    totalCredits += credits;
  });

  const gpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
  await Student.findByIdAndUpdate(studentId, { gpa });
  return gpa;
};

// ─── CREATE: Enroll student in a course ──────────────────────────────────────
const createEnrollment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { studentId, courseId } = req.body;

    const [student, course] = await Promise.all([
      Student.findById(studentId),
      Course.findById(courseId)
    ]);

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.isFull) {
      return res.status(400).json({ success: false, message: `Course "${course.courseName}" is full (${course.maxCapacity}/${course.maxCapacity})` });
    }
    if (student.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Only active students can be enrolled' });
    }

    // Check for duplicate enrollment
    const existing = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student is already enrolled in this course' });
    }

    const enrollment = new Enrollment({ student: studentId, course: courseId, ...req.body });
    await enrollment.save({ session });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, { $inc: { currentEnrollment: 1 } }, { session });

    await session.commitTransaction();
    await enrollment.populate(['student', 'course']);

    res.status(201).json({ success: true, message: 'Student enrolled successfully', data: enrollment });
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Student is already enrolled in this course' });
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// ─── READ ALL: Get enrollments with filters ───────────────────────────────────
const getAllEnrollments = async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, courseId, status } = req.query;

    const filter = {};
    if (studentId) filter.student = studentId;
    if (courseId) filter.course = courseId;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .populate('student', 'firstName lastName studentId department gpa')
        .populate('course', 'courseCode courseName credits semester department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Enrollment.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: enrollments,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── READ ONE ─────────────────────────────────────────────────────────────────
const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('student')
      .populate('course');
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE: Update grade / status ───────────────────────────────────────────
const updateEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('student').populate('course');

    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    // Recalculate GPA after grade update
    await recalculateStudentGPA(enrollment.student._id);

    res.json({ success: true, message: 'Enrollment updated successfully', data: enrollment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE: Drop student from course ────────────────────────────────────────
const deleteEnrollment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate('course').populate('student');
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    // Decrease course enrollment count
    await Course.findByIdAndUpdate(enrollment.course._id, { $inc: { currentEnrollment: -1 } }, { session });
    await Enrollment.findByIdAndDelete(req.params.id, { session });

    await session.commitTransaction();
    await recalculateStudentGPA(enrollment.student._id);

    res.json({
      success: true,
      message: `${enrollment.student.fullName} dropped from ${enrollment.course.courseName}`
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// ─── STATS ────────────────────────────────────────────────────────────────────
const getEnrollmentStats = async (req, res) => {
  try {
    const [total, byStatus, topCourses, gradeDistribution] = await Promise.all([
      Enrollment.countDocuments(),
      Enrollment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Enrollment.aggregate([
        { $group: { _id: '$course', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
        { $unwind: '$course' },
        { $project: { courseName: '$course.courseName', courseCode: '$course.courseCode', count: 1 } }
      ]),
      Enrollment.aggregate([
        { $match: { 'grade.letter': { $ne: null } } },
        { $group: { _id: '$grade.letter', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({ success: true, data: { total, byStatus, topCourses, gradeDistribution } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createEnrollment, getAllEnrollments, getEnrollmentById,
  updateEnrollment, deleteEnrollment, getEnrollmentStats
};
