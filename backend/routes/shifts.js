import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getDb } from '../config/firebase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get shifts by date range
router.get('/',
    [
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601(),
        query('date').optional().isISO8601()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid date format',
                    details: errors.array()
                });
            }

            const db = getDb();
            let shiftsQuery = db.collection('shifts');

            // Filter by specific date
            if (req.query.date) {
                shiftsQuery = shiftsQuery.where('date', '==', req.query.date);
            }
            // Filter by date range
            else if (req.query.startDate && req.query.endDate) {
                shiftsQuery = shiftsQuery
                    .where('date', '>=', req.query.startDate)
                    .where('date', '<=', req.query.endDate);
            }

            const snapshot = await shiftsQuery.orderBy('date').orderBy('startTime').get();

            const shifts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            res.json({
                success: true,
                data: shifts
            });
        } catch (error) {
            console.error('Get shifts error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch shifts'
            });
        }
    }
);

// Get shift by ID
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const doc = await db.collection('shifts').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Shift not found'
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
        console.error('Get shift error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch shift'
        });
    }
});

// Create new shift (admin only)
router.post('/',
    verifyAdmin,
    [
        body('date').isISO8601(),
        body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('position').trim().notEmpty(),
        body('employeeId').optional().trim(),
        body('employeeName').optional().trim(),
        body('notes').optional().trim()
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
            const { date, startTime, endTime, position, employeeId, employeeName, notes } = req.body;

            const shiftData = {
                date,
                startTime,
                endTime,
                position,
                employeeId: employeeId || null,
                employeeName: employeeName || null,
                notes: notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const docRef = await db.collection('shifts').add(shiftData);

            res.status(201).json({
                success: true,
                data: {
                    id: docRef.id,
                    ...shiftData
                }
            });
        } catch (error) {
            console.error('Create shift error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create shift'
            });
        }
    }
);

// Update shift (admin only)
router.put('/:id',
    verifyAdmin,
    [
        body('date').optional().isISO8601(),
        body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('position').optional().trim().notEmpty(),
        body('employeeId').optional(),
        body('employeeName').optional().trim(),
        body('notes').optional().trim()
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
            const shiftRef = db.collection('shifts').doc(req.params.id);
            const doc = await shiftRef.get();

            if (!doc.exists) {
                return res.status(404).json({
                    success: false,
                    error: 'Shift not found'
                });
            }

            const updateData = {
                ...req.body,
                updatedAt: new Date().toISOString()
            };

            await shiftRef.update(updateData);

            const updatedDoc = await shiftRef.get();

            res.json({
                success: true,
                data: {
                    id: updatedDoc.id,
                    ...updatedDoc.data()
                }
            });
        } catch (error) {
            console.error('Update shift error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update shift'
            });
        }
    }
);

// Delete shift (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const db = getDb();
        const shiftRef = db.collection('shifts').doc(req.params.id);
        const doc = await shiftRef.get();

        if (!doc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Shift not found'
            });
        }

        await shiftRef.delete();

        res.json({
            success: true,
            message: 'Shift deleted successfully'
        });
    } catch (error) {
        console.error('Delete shift error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete shift'
        });
    }
});

export default router;
