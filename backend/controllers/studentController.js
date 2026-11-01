/**
 * Student Controller - Full CRUD Operations
 *
 * Analogous to C++ class method implementations (.cpp file).
 * Each function is a member function of the "StudentController" module.
 *
 * CRUD Mapping:
 *   Create  → POST   /api/students
 *   Read    → GET    /api/students, /api/students/:id
 *   Update  → PUT    /api/students/:id
 *   Delete  → DELETE /api/students/:id
 *
 * Structural File Handling:
 *   - Data persisted in MongoDB (structured binary storage)
 *   - Queries use indexes for O(log n) lookup (like sorted file structures)
 *   - Aggregation pipelines for complex multi-document reads
 */

const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');

// ─── CREATE: Add a new student ────────────────────────────────────────────────
const createStudent = async (req, res) => {
  try {
    // Auto-generate studentId if not provided
    if (!req.body.studentId) {
      const count = await Student.countDocuments();
      req.body.studentId = `STU${String(count + 1).padStart(4, '0')}`;
    }

    const student = new Student(req.body);
    const saved = await student.save();

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: saved
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `A student with that ${field} already exists`
      });
    }
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create student'
    });
  }
};

// ─── READ ALL: Get all students with search, filter, pagination ───────────────
const getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      status = '',
      yearOfStudy = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object (like a C++ struct for query parameters)
    const filter = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (yearOfStudy) filter.yearOfStudy = parseInt(yearOfStudy);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [students, total] = await Promise.all([
      Student.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Student.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── READ ONE: Get a single student by ID ────────────────────────────────────
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Also fetch enrollment count
    const enrollmentCount = await Enrollment.countDocuments({ student: req.params.id });

    res.json({
      success: true,
      data: { ...student.toJSON(), enrollmentCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE: Modify student data ──────────────────────────────────────────────
const updateStudent = async (req, res) => {
  try {
    // Prevent studentId & email from being changed to existing values
    const update = { ...req.body };
    delete update.__v;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `A student with that ${field} already exists`
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE: Remove a student ─────────────────────────────────────────────────
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Cascade delete enrollments (structured data integrity)
    await Enrollment.deleteMany({ student: req.params.id });
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Student "${student.fullName}" deleted successfully along with all enrollments`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── STATS: Dashboard statistics ─────────────────────────────────────────────
const getStudentStats = async (req, res) => {
  try {
    const [
      total,
      active,
      byDepartment,
      byYear,
      avgGpa,
      recentStudents
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'Active' }),
      Student.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Student.aggregate([
        { $group: { _id: '$yearOfStudy', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Student.aggregate([
        { $match: { gpa: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$gpa' } } }
      ]),
      Student.find().sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        byDepartment,
        byYear,
        avgGpa: avgGpa[0]?.avg?.toFixed(2) || '0.00',
        recentStudents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentStats
};
