// API Configuration
// This allows both local development and deployed frontend to use the same backend

const isProduction = import.meta.env.PROD;

// Firebase Cloud Function URL (will be set after deployment)
const FIREBASE_FUNCTION_URL =
  'https://us-central1-scallywags-scheduler-dev.cloudfunctions.net/api';

// For development, you can choose to use:
// - Local backend: 'http://localhost:3001/api'
// - Firebase backend: FIREBASE_FUNCTION_URL
const API_BASE_URL = isProduction
  ? FIREBASE_FUNCTION_URL // Production always uses Firebase
  : FIREBASE_FUNCTION_URL; // Development also uses Firebase (for testing)

// If you want to test with local backend during development, change the line above to:
// : 'http://localhost:3001/api';

export default API_BASE_URL;

// Usage in services:
// import API_BASE_URL from '../config/api';
// const response = await fetch(`${API_BASE_URL}/auth/login`, { ... });
