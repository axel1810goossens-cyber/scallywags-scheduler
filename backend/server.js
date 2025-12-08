import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import shiftRoutes from './routes/shifts.js';
import settingsRoutes from './routes/settings.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase
initializeFirebase();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Scallywags Scheduler API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Server started successfully!\n');
  console.log(`📡 API running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `🔐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`
  );
  console.log('\n📋 Available endpoints:');
  console.log('   GET  /health');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/me');
  console.log('   GET  /api/employees');
  console.log('   GET  /api/shifts');
  console.log('   GET  /api/settings');
  console.log('\n💡 Run "npm run init-db" to initialize the database\n');
});
