/**
 * Course Controller - Full CRUD Operations
 *
 * Manages academic course records with enrollment capacity enforcement.
 */

const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ─── CREATE ───────────────────────────────────────────────────────────────────
const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    const saved = await course.save();
    res.status(201).json({ success: true, message: 'Course created successfully', data: saved });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── READ ALL ─────────────────────────────────────────────────────────────────
const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      semester = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { courseCode: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [courses, total] = await Promise.all([
      Course.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Course.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: courses,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── READ ONE ─────────────────────────────────────────────────────────────────
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
const updateCourse = async (req, res) => {
  try {
    const update = { ...req.body };
    delete update.__v;

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    res.json({ success: true, message: 'Course updated successfully', data: course });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check if course has active enrollments
    const enrollmentCount = await Enrollment.countDocuments({ course: req.params.id, status: 'Enrolled' });
    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course with ${enrollmentCount} active enrollment(s). Please drop students first.`
      });
    }

    await Enrollment.deleteMany({ course: req.params.id });
    await Course.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: `Course "${course.courseName}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── STATS ────────────────────────────────────────────────────────────────────
const getCourseStats = async (req, res) => {
  try {
    const [total, active, byDepartment, bySemester] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ status: 'Active' }),
      Course.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Course.aggregate([{ $group: { _id: '$semester', count: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    ]);

    res.json({ success: true, data: { total, active, byDepartment, bySemester } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse, getCourseStats };
