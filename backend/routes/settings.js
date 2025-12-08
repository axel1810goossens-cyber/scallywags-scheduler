import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDb } from '../config/firebase.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get settings
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const doc = await db.collection('settings').doc('app_settings').get();

        if (!doc.exists) {
            // Return default settings if none exist
            return res.json({
                success: true,
                data: {
                    businessHours: {
                        monday: { open: '09:00', close: '22:00' },
                        tuesday: { open: '09:00', close: '22:00' },
                        wednesday: { open: '09:00', close: '22:00' },
                        thursday: { open: '09:00', close: '22:00' },
                        friday: { open: '09:00', close: '23:00' },
                        saturday: { open: '10:00', close: '23:00' },
                        sunday: { open: '10:00', close: '21:00' }
                    },
                    positions: [
                        'Server',
                        'Bartender',
                        'Manager',
                        'Kitchen',
                        'Host'
                    ],
                    minShiftDuration: 4,
                    maxShiftDuration: 12,
                    maxWeeklyHours: 40
                }
            });
        }

        res.json({
            success: true,
            data: doc.data()
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch settings'
        });
    }
});

// Update settings (admin only)
router.put('/',
    verifyAdmin,
    [
        body('businessHours').optional().isObject(),
        body('positions').optional().isArray(),
        body('minShiftDuration').optional().isInt({ min: 1, max: 24 }),
        body('maxShiftDuration').optional().isInt({ min: 1, max: 24 }),
        body('maxWeeklyHours').optional().isInt({ min: 1, max: 168 })
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
            const settingsRef = db.collection('settings').doc('app_settings');
            
            const updateData = {
                ...req.body,
                updatedAt: new Date().toISOString()
            };

            // Use set with merge to create if doesn't exist
            await settingsRef.set(updateData, { merge: true });

            const updatedDoc = await settingsRef.get();

            res.json({
                success: true,
                data: updatedDoc.data()
            });
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update settings'
            });
        }
    }
);

export default router;
