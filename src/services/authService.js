import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
    // Login with email and password
    login: async (email, password) => {
        // Mock admin login for testing
        if (email === 'admin@test.com' && password === 'admin') {
            const mockUser = {
                uid: 'admin-test-id',
                email: 'admin@scallywags.com',
                displayName: 'Test Admin',
                emailVerified: true
            };
            // Store in localStorage for persistence
            localStorage.setItem('mockUser', JSON.stringify(mockUser));
            return {
                success: true,
                user: mockUser
            };
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Logout
    logout: async () => {
        // Clear mock user from localStorage
        localStorage.removeItem('mockUser');

        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Reset password
    resetPassword: async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Subscribe to auth state changes
    onAuthStateChange: (callback) => {
        // Check for stored mock user on initialization
        const storedMockUser = localStorage.getItem('mockUser');
        if (storedMockUser) {
            try {
                const mockUser = JSON.parse(storedMockUser);
                // Call callback immediately with mock user
                setTimeout(() => callback(mockUser), 0);
            } catch (error) {
                console.error('Error parsing stored mock user:', error);
            }
        }

        return onAuthStateChanged(auth, callback);
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
        return auth.currentUser;
    }
};
