/**
 * Student Management System - Express Server
 *
 * Architecture follows C++ OOP principles:
 *  - Encapsulation: Each route/controller encapsulates specific logic
 *  - Modularity: Separate files per concern (models, routes, controllers)
 *  - Abstraction: Controllers hide DB implementation from route layer
 *  - Inheritance: Base error handler provides shared error-handling behavior
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Import route modules (analogous to including header files in C++)
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// ─── Middleware Pipeline ──────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── Route Registration (Menu-Driven Interface Analogy) ───────────────────────
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// ─── Error Handling (Structured Exception Handling like C++) ──────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Database Connection & Server Start ───────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studentmanagement';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Student Management System API Ready`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
