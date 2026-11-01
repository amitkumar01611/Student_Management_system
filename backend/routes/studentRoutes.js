/**
 * Student Routes - Menu-Driven API Endpoints
 * Analogous to a C++ menu switch-case that dispatches to functions
 */

const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentStats
} = require('../controllers/studentController');

// Route menu (each endpoint = a menu option in a C++ console app)
router.get('/stats', getStudentStats);    // Statistics dashboard
router.get('/', getAllStudents);           // List all students
router.post('/', createStudent);          // Add new student
router.get('/:id', getStudentById);       // View student details
router.put('/:id', updateStudent);        // Edit student
router.delete('/:id', deleteStudent);     // Remove student

module.exports = router;
