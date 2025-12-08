import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDb } from '../config/firebase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all employees
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const snapshot = await db.collection('employees').orderBy('name').get();

        const employees = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json({
            success: true,
            data: employees
        });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch employees'
        });
    }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const doc = await db.collection('employees').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: doc.id,
                ...doc.data()
            }
        });
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch employee'
        });
    }
});

// Create new employee (admin only)
router.post('/',
    verifyAdmin,
    [
        body('name').trim().notEmpty(),
        body('email').isEmail().normalizeEmail(),
        body('phone').optional().trim(),
        body('position').trim().notEmpty(),
        body('availability').optional().isObject()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array()
                });
            }

            const db = getDb();
            const { name, email, phone, position, availability } = req.body;

            // Check if email already exists
            const existingEmployee = await db.collection('employees')
                .where('email', '==', email)
                .limit(1)
                .get();

            if (!existingEmployee.empty) {
                return res.status(400).json({
                    success: false,
                    error: 'Employee with this email already exists'
                });
            }

            const employeeData = {
                name,
                email,
                phone: phone || '',
                position,
                availability: availability || {},
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const docRef = await db.collection('employees').add(employeeData);

            res.status(201).json({
                success: true,
                data: {
                    id: docRef.id,
                    ...employeeData
                }
            });
        } catch (error) {
            console.error('Create employee error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create employee'
            });
        }
    }
);

// Update employee (admin only)
router.put('/:id',
    verifyAdmin,
    [
        body('name').optional().trim().notEmpty(),
        body('email').optional().isEmail().normalizeEmail(),
        body('phone').optional().trim(),
        body('position').optional().trim().notEmpty(),
        body('availability').optional().isObject()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array()
                });
            }

            const db = getDb();
            const employeeRef = db.collection('employees').doc(req.params.id);
            const doc = await employeeRef.get();

            if (!doc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'Employee not found'
                });
            }

            const updateData = {
                ...req.body,
                updatedAt: new Date().toISOString()
            };

            await employeeRef.update(updateData);

            const updatedDoc = await employeeRef.get();

            res.json({
                success: true,
                data: {
                    id: updatedDoc.id,
                    ...updatedDoc.data()
                }
            });
        } catch (error) {
            console.error('Update employee error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update employee'
            });
        }
    }
);

// Delete employee (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const db = getDb();
        const employeeRef = db.collection('employees').doc(req.params.id);
        const doc = await employeeRef.get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Employee not found'
            });
        }

        await employeeRef.delete();

        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete employee'
        });
    }
});

export default router;
