const express = require('express');
const router = express.Router();
const {
  createEnrollment, getAllEnrollments, getEnrollmentById,
  updateEnrollment, deleteEnrollment, getEnrollmentStats
} = require('../controllers/enrollmentController');

router.get('/stats', getEnrollmentStats);
router.get('/', getAllEnrollments);
router.post('/', createEnrollment);
router.get('/:id', getEnrollmentById);
router.put('/:id', updateEnrollment);
router.delete('/:id', deleteEnrollment);

module.exports = router;
