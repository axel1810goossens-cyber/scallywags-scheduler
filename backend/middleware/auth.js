import jwt from 'jsonwebtoken';
import { getAuth } from '../config/firebase.js';

// Verify JWT token
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT token
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-local-dev';
        const decoded = jwt.verify(token, jwtSecret);
        
        // Attach user info to request
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        }
        
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

// Verify admin role
export const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    next();
};

// Optional: Verify Firebase ID token (for future Firebase Auth integration)
export const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const idToken = authHeader.substring(7);
        const auth = getAuth();
        
        // Verify Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);
        
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: decodedToken.role || 'user'
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid Firebase token'
        });
    }
};
