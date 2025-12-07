import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { mockEmployees } from '../utils/mockData';
import { localStorageService } from './localStorageService';

// Initialize localStorage with mock data on first load
localStorageService.initialize(mockEmployees, null, null);

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
    try {
        return db && import.meta.env.VITE_FIREBASE_API_KEY !== 'your-api-key-here';
    } catch {
        return false;
    }
};

export const employeeService = {
    // Add new employee
    addEmployee: async (employeeData) => {
        if (!isFirebaseConfigured()) {
            const newEmployee = {
                ...employeeData,
                id: `emp_${Date.now()}`,
                createdAt: new Date()
            };
            localStorageService.addEmployee(newEmployee);
            return { success: true, id: newEmployee.id };
        }

        try {
            const docRef = await addDoc(collection(db, 'employees'), {
                ...employeeData,
                createdAt: new Date()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.warn('Firebase add failed, using localStorage');
            const newEmployee = {
                ...employeeData,
                id: `emp_${Date.now()}`,
                createdAt: new Date()
            };
            localStorageService.addEmployee(newEmployee);
            return { success: true, id: newEmployee.id };
        }
    },

    // Update employee
    updateEmployee: async (id, updates) => {
        if (!isFirebaseConfigured()) {
            const success = localStorageService.updateEmployee(id, updates);
            return success ? { success: true } : { success: false, error: 'Employee not found' };
        }

        try {
            const employeeRef = doc(db, 'employees', id);
            await updateDoc(employeeRef, {
                ...updates,
                updatedAt: new Date()
            });
            return { success: true };
        } catch (error) {
            const success = localStorageService.updateEmployee(id, updates);
            return success ? { success: true } : { success: false, error: error.message };
        }
    },

    // Delete employee
    deleteEmployee: async (id) => {
        if (!isFirebaseConfigured()) {
            localStorageService.deleteEmployee(id);
            return { success: true };
        }

        try {
            await deleteDoc(doc(db, 'employees', id));
            return { success: true };
        } catch (error) {
            localStorageService.deleteEmployee(id);
            return { success: true };
        }
    },

    // Get all employees (one-off)
    getEmployees: async () => {
        if (!isFirebaseConfigured()) {
            return { success: true, data: localStorageService.getEmployees() };
        }

        try {
            const q = query(collection(db, 'employees'), orderBy('name'));
            const snapshot = await getDocs(q);
            const employees = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            return { success: true, data: employees };
        } catch (error) {
            console.warn('Firebase fetch failed, using localStorage', error);
            return { success: true, data: localStorageService.getEmployees() };
        }
    },

    // Subscribe to employees list
    subscribeToEmployees: (callback) => {
        // For localStorage, we'll simulate subscription with polling
        if (!isFirebaseConfigured()) {
            console.log('Using localStorage for employees');

            // Initial call
            callback(localStorageService.getEmployees());

            // Set up polling to detect changes (every 500ms)
            const interval = setInterval(() => {
                callback(localStorageService.getEmployees());
            }, 500);

            // Return cleanup function
            return () => clearInterval(interval);
        }

        try {
            const q = query(collection(db, 'employees'), orderBy('name'));
            return onSnapshot(q,
                (snapshot) => {
                    const employees = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    callback(employees);
                },
                (error) => {
                    console.warn('Firebase subscription failed, using localStorage', error);
                    callback(localStorageService.getEmployees());
                }
            );
        } catch (error) {
            console.warn('Firebase init failed, using localStorage');
            callback(localStorageService.getEmployees());
            return () => { };
        }
    },

    // Load sample data
    loadSampleData: () => {
        localStorageService.setEmployees(mockEmployees);
        return { success: true };
    }
};
