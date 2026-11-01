const express = require('express');
const router = express.Router();
const {
  createCourse, getAllCourses, getCourseById,
  updateCourse, deleteCourse, getCourseStats
} = require('../controllers/courseController');

router.get('/stats', getCourseStats);
router.get('/', getAllCourses);
router.post('/', createCourse);
router.get('/:id', getCourseById);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
