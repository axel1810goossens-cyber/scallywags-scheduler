import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getDb } from '../config/firebase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Login endpoint
router.post('/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ],
    async (req, res) => {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid email or password format',
                    details: errors.array()
                });
            }

            const { email, password } = req.body;
            const db = getDb();

            // Find user by email
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('email', '==', email).limit(1).get();

            if (snapshot.empty) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            const userDoc = snapshot.docs[0];
            const userData = userDoc.data();

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // Generate JWT token
            const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-local-dev';
            const token = jwt.sign(
                {
                    uid: userDoc.id,
                    email: userData.email,
                    role: userData.role
                },
                jwtSecret,
                { expiresIn: '24h' }
            );

            // Update last login
            await usersRef.doc(userDoc.id).update({
                lastLogin: new Date().toISOString()
            });

            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: userDoc.id,
                        email: userData.email,
                        name: userData.name,
                        role: userData.role
                    }
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Login failed. Please try again.'
            });
        }
    }
);

// Get current user info
router.get('/me', verifyToken, async (req, res) => {
    try {
        const db = getDb();
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const userData = userDoc.data();
        
        res.json({
            success: true,
            data: {
                id: userDoc.id,
                email: userData.email,
                name: userData.name,
                role: userData.role
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user data'
        });
    }
});

// Refresh token
router.post('/refresh', verifyToken, async (req, res) => {
    try {
        // Generate new token with extended expiry
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-local-dev';
        const token = jwt.sign(
            {
                uid: req.user.uid,
                email: req.user.email,
                role: req.user.role
            },
            jwtSecret,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            data: { token }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh token'
        });
    }
});

export default router;
