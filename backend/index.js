import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import shiftRoutes from './routes/shifts.js';
import settingsRoutes from './routes/settings.js';

// Define secret
const jwtSecret = defineSecret('JWT_SECRET');

// Initialize Firebase Admin (no service account needed in Cloud Functions)
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();

// Middleware
app.use(cors({ origin: true })); // Allow all origins in Cloud Functions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Scallywags Scheduler API is running',
    timestamp: new Date().toISOString(),
    environment: 'Firebase Cloud Functions',
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/shifts', shiftRoutes);
app.use('/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err, req, res) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Export the Express app as a Cloud Function with secrets
export const api = functions
  .runWith({ secrets: [jwtSecret] })
  .https.onRequest(app);
