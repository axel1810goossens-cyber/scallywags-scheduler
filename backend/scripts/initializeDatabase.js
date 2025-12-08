import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { initializeFirebase, getDb } from '../config/firebase.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { addDays, startOfWeek, format } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Import mock data from frontend
const loadMockData = () => {
    try {
        // Read the mockData.js file
        const mockDataPath = join(__dirname, '../../src/utils/mockData.js');
        const mockDataContent = readFileSync(mockDataPath, 'utf8');
        
        // Import date-fns functions for evaluation
        const today = new Date();
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
        
        // Extract employees array
        const employeesMatch = mockDataContent.match(/export const mockEmployees = (\[[\s\S]*?\n\]);/);
        // Extract shifts array  
        const shiftsMatch = mockDataContent.match(/export const mockShifts = (\[[\s\S]*?\]);/);
        
        if (employeesMatch && shiftsMatch) {
            // Evaluate the arrays (safe in this controlled script context)
            const mockEmployees = eval(employeesMatch[1]);
            const mockShifts = eval(shiftsMatch[1]);
            return { mockEmployees, mockShifts };
        }
        
        throw new Error('Could not parse mock data');
    } catch (error) {
        console.error('⚠️  Could not load mock data from mockData.js:', error.message);
        console.log('💡 Continuing with minimal sample data...\n');
        return null;
    }
};

const initializeDatabase = async () => {
    console.log('🚀 Starting database initialization...\n');

    try {
        // Initialize Firebase
        initializeFirebase();
        const db = getDb();
        
        // Load mock data
        const mockData = loadMockData();

        // 1. Create admin user
        console.log('👤 Creating admin user...');
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@scallywags.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminName = process.env.ADMIN_NAME || 'Admin Manager';

        // Check if admin already exists
        const existingAdmin = await db.collection('users')
            .where('email', '==', adminEmail)
            .limit(1)
            .get();

        if (!existingAdmin.empty) {
            console.log('⚠️  Admin user already exists, skipping...');
        } else {
            const passwordHash = await bcrypt.hash(adminPassword, 10);
            
            await db.collection('users').add({
                email: adminEmail,
                name: adminName,
                role: 'admin',
                passwordHash,
                createdAt: new Date().toISOString(),
                lastLogin: null
            });

            console.log('✅ Admin user created successfully');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
            console.log('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!\n');
        }

        // 2. Initialize default settings
        console.log('⚙️  Creating default settings...');
        const settingsRef = db.collection('settings').doc('app_settings');
        const settingsDoc = await settingsRef.get();

        if (settingsDoc.exists) {
            console.log('⚠️  Settings already exist, skipping...\n');
        } else {
            await settingsRef.set({
                businessHours: {
                    monday: { open: '11:00', close: '04:00' },
                    tuesday: { open: '11:00', close: '04:00' },
                    wednesday: { open: '11:00', close: '04:00' },
                    thursday: { open: '11:00', close: '04:00' },
                    friday: { open: '11:00', close: '04:00' },
                    saturday: { open: '11:00', close: '04:00' },
                    sunday: { open: '11:00', close: '04:00' }
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
                maxWeeklyHours: 40,
                createdAt: new Date().toISOString()
            });

            console.log('✅ Default settings created\n');
        }

        // 3. Create employees from mock data
        console.log('👥 Checking for existing employees...');
        const employeesSnapshot = await db.collection('employees').limit(1).get();

        if (!employeesSnapshot.empty) {
            console.log('⚠️  Employees already exist, skipping employee data...\n');
        } else {
            if (mockData && mockData.mockEmployees) {
                console.log(`📝 Creating ${mockData.mockEmployees.length} employees from mockData.js...`);
                
                const employeeIdMap = {}; // Map old IDs to new Firestore IDs
                
                // Process in batches of 500 (Firestore limit)
                const batchSize = 500;
                for (let i = 0; i < mockData.mockEmployees.length; i += batchSize) {
                    const batch = db.batch();
                    const chunk = mockData.mockEmployees.slice(i, i + batchSize);
                    
                    chunk.forEach(employee => {
                        const docRef = db.collection('employees').doc();
                        employeeIdMap[employee.id] = docRef.id;
                        
                        batch.set(docRef, {
                            name: employee.name,
                            email: employee.email,
                            phone: employee.phone,
                            position: employee.position,
                            availability: employee.availability,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                    });

                    await batch.commit();
                }

                console.log(`✅ Created ${mockData.mockEmployees.length} employees\n`);
                
                // Store the ID mapping for shifts
                mockData.employeeIdMap = employeeIdMap;
            } else {
                console.log('📝 Creating 3 sample employees...');
                
                const sampleEmployees = [
                    {
                        name: 'Sarah Jenkins',
                        email: 'sarah.j@scallywags.com',
                        phone: '+1 (555) 123-4567',
                        position: 'Server',
                        availability: {
                            monday: [{ start: '11:00', end: '19:00' }],
                            tuesday: [{ start: '11:00', end: '19:00' }],
                            wednesday: [{ start: '11:00', end: '19:00' }],
                            thursday: [{ start: '11:00', end: '19:00' }],
                            friday: [{ start: '11:00', end: '19:00' }]
                        }
                    },
                    {
                        name: 'Mike Ross',
                        email: 'mike.r@scallywags.com',
                        phone: '+1 (555) 234-5678',
                        position: 'Bartender',
                        availability: {
                            thursday: [{ start: '16:00', end: '04:00' }],
                            friday: [{ start: '16:00', end: '04:00' }],
                            saturday: [{ start: '16:00', end: '04:00' }],
                            sunday: [{ start: '12:00', end: '04:00' }]
                        }
                    },
                    {
                        name: 'Jessica Pearson',
                        email: 'jessica.p@scallywags.com',
                        phone: '+1 (555) 345-6789',
                        position: 'Manager',
                        availability: {
                            monday: [{ start: '10:00', end: '20:00' }],
                            tuesday: [{ start: '10:00', end: '20:00' }],
                            wednesday: [{ start: '10:00', end: '20:00' }],
                            thursday: [{ start: '10:00', end: '20:00' }],
                            friday: [{ start: '10:00', end: '20:00' }]
                        }
                    }
                ];

                const batch = db.batch();
                sampleEmployees.forEach(employee => {
                    const docRef = db.collection('employees').doc();
                    batch.set(docRef, {
                        ...employee,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                });

                await batch.commit();
                console.log(`✅ Created ${sampleEmployees.length} sample employees\n`);
            }
        }
        
        // 4. Create shifts from mock data
        console.log('📅 Checking for existing shifts...');
        const shiftsSnapshot = await db.collection('shifts').limit(1).get();

        if (!shiftsSnapshot.empty) {
            console.log('⚠️  Shifts already exist, skipping shift data...\n');
        } else {
            if (mockData && mockData.mockShifts && mockData.employeeIdMap) {
                console.log(`📝 Creating ${mockData.mockShifts.length} shifts from mockData.js...`);
                
                const batch = db.batch();
                mockData.mockShifts.forEach(shift => {
                    const docRef = db.collection('shifts').doc();
                    const newEmployeeId = mockData.employeeIdMap[shift.employeeId];
                    
                    batch.set(docRef, {
                        date: shift.date,
                        startTime: shift.startTime,
                        endTime: shift.endTime,
                        position: shift.position,
                        employeeId: newEmployeeId || null,
                        employeeName: shift.employeeName,
                        notes: shift.notes || '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                });

                await batch.commit();
                console.log(`✅ Created ${mockData.mockShifts.length} shifts\n`);
            } else {
                console.log('⚠️  No shifts to create (mock data not available)\n');
            }
        }

        console.log('✨ Database initialization completed successfully!\n');
        console.log('📋 Summary:');
        console.log('   • Admin user ready');
        console.log('   • Default settings configured');
        if (mockData) {
            console.log(`   • ${mockData.mockEmployees?.length || 0} employees loaded`);
            console.log(`   • ${mockData.mockShifts?.length || 0} shifts loaded`);
        } else {
            console.log('   • Sample data loaded');
        }
        console.log('\n🎯 Next steps:');
        console.log('   1. Deploy to Firebase: firebase deploy');
        console.log('   2. Test login with admin credentials');
        console.log('   3. Update frontend to use API endpoints\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
};

// Run initialization
initializeDatabase();
