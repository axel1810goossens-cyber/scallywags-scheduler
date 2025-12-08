import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
  // Login with email and password
  login: async (email, password) => {
    // Mock admin login for testing (works with or without Firebase)
    if (email === 'admin@test.com' && password === 'admin') {
      const mockUser = {
        uid: 'admin-test-id',
        email: 'admin@scallywags.com',
        displayName: 'Test Admin',
        emailVerified: true,
      };
      // Store in localStorage for persistence
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      return {
        success: true,
        user: mockUser,
      };
    }

    // If Firebase is not configured, return error
    if (!auth) {
      return {
        success: false,
        error:
          'Authentication service is not configured. Please contact administrator.',
      };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    // Clear mock user from localStorage
    localStorage.removeItem('mockUser');

    // If Firebase is not configured, just return success
    if (!auth) {
      return { success: true };
    }

    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reset password
  resetPassword: async email => {
    // If Firebase is not configured, return error
    if (!auth) {
      return {
        success: false,
        error: 'Password reset requires Firebase configuration.',
      };
    }

    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Subscribe to auth state changes
  onAuthStateChange: callback => {
    // If Firebase is configured, use Firebase's auth state listener
    if (auth) {
      return onAuthStateChanged(auth, user => {
        if (user) {
          // Firebase user is logged in
          callback(user);
        } else {
          // No Firebase user, check for mock user
          const storedMockUser = localStorage.getItem('mockUser');
          if (storedMockUser) {
            try {
              const mockUser = JSON.parse(storedMockUser);
              callback(mockUser);
            } catch (error) {
              console.error('Error parsing stored mock user:', error);
              callback(null);
            }
          } else {
            callback(null);
          }
        }
      });
    }

    // Firebase not configured, check for mock user only
    const storedMockUser = localStorage.getItem('mockUser');
    if (storedMockUser) {
      try {
        const mockUser = JSON.parse(storedMockUser);
        setTimeout(() => callback(mockUser), 0);
      } catch (error) {
        console.error('Error parsing stored mock user:', error);
        setTimeout(() => callback(null), 0);
      }
    } else {
      setTimeout(() => callback(null), 0);
    }

    return () => {};
  },

  // Get current user
  getCurrentUser: () => {
    // Check for mock user first
    const storedMockUser = localStorage.getItem('mockUser');
    if (storedMockUser) {
      try {
        return JSON.parse(storedMockUser);
      } catch (error) {
        console.error('Error parsing stored mock user:', error);
      }
    }
    return auth ? auth.currentUser : null;
  },
};
