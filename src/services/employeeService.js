import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { localStorageService } from './localStorageService';

export const employeeService = {
  // Add new employee
  addEmployee: async employeeData => {
    if (!db) {
      return {
        success: false,
        error: 'Database not configured. Please login first.',
      };
    }
    try {
      const docRef = await addDoc(collection(db, 'employees'), {
        ...employeeData,
        createdAt: new Date(),
      });
      // Invalidate cache on write
      localStorageService.invalidateEmployeesCache();
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding employee:', error);
      return { success: false, error: error.message };
    }
  },

  // Update employee
  updateEmployee: async (id, updates) => {
    if (!db) {
      return {
        success: false,
        error: 'Database not configured. Please login first.',
      };
    }
    try {
      const employeeRef = doc(db, 'employees', id);
      await updateDoc(employeeRef, {
        ...updates,
        updatedAt: new Date(),
      });
      // Invalidate cache on write
      localStorageService.invalidateEmployeesCache();
      return { success: true };
    } catch (error) {
      console.error('Error updating employee:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete employee
  deleteEmployee: async id => {
    if (!db) {
      return {
        success: false,
        error: 'Database not configured. Please login first.',
      };
    }
    try {
      await deleteDoc(doc(db, 'employees', id));
      // Invalidate cache on write
      localStorageService.invalidateEmployeesCache();
      return { success: true };
    } catch (error) {
      console.error('Error deleting employee:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all employees (one-off)
  getEmployees: async () => {
    // Check cache first
    const cached = localStorageService.getCachedEmployees();
    if (cached) {
      return { success: true, data: cached };
    }

    if (!db) {
      return {
        success: false,
        error: 'Database not configured. Please login first.',
      };
    }

    try {
      const q = query(collection(db, 'employees'), orderBy('name'));
      const snapshot = await getDocs(q);
      const employees = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Cache the result
      localStorageService.setCachedEmployees(employees);
      return { success: true, data: employees };
    } catch (error) {
      console.error('Error fetching employees:', error);
      return { success: false, error: error.message };
    }
  },

  // Subscribe to employees list
  subscribeToEmployees: callback => {
    if (!db) {
      console.error('Database not configured');
      callback([]);
      return () => {};
    }
    try {
      const q = query(collection(db, 'employees'), orderBy('name'));
      return onSnapshot(
        q,
        snapshot => {
          const employees = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(employees);
        },
        error => {
          console.error('Firebase subscription error:', error);
          callback([]);
        }
      );
    } catch (error) {
      console.error('Error setting up subscription:', error);
      callback([]);
      return () => {};
    }
  },
};
