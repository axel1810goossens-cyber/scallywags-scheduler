import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { mockShifts } from '../utils/mockData';
import { localStorageService } from './localStorageService';

const SHIFTS_COLLECTION = 'shifts';

// Initialize localStorage with mock data on first load
localStorageService.initialize(null, mockShifts, null);

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  try {
    return db && import.meta.env.VITE_FIREBASE_API_KEY !== 'your-api-key-here';
  } catch {
    return false;
  }
};

export const shiftService = {
  // Add new shift
  addShift: async shiftData => {
    if (!isFirebaseConfigured()) {
      const newShift = {
        ...shiftData,
        id: `shift_${Date.now()}`,
        createdAt: new Date(),
      };
      localStorageService.addShift(newShift);
      return { success: true, id: newShift.id };
    }

    try {
      const docRef = await addDoc(collection(db, SHIFTS_COLLECTION), {
        ...shiftData,
        createdAt: new Date(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      const newShift = {
        ...shiftData,
        id: `shift_${Date.now()}`,
        createdAt: new Date(),
      };
      localStorageService.addShift(newShift);
      return { success: true, id: newShift.id };
    }
  },

  // Batch add multiple shifts
  batchAddShifts: async shiftsData => {
    if (!isFirebaseConfigured()) {
      const newShifts = shiftsData.map((shiftData, index) => ({
        ...shiftData,
        id: `shift_${Date.now()}_${index}`,
        createdAt: new Date(),
      }));
      localStorageService.addShifts(newShifts);
      return { success: true, count: newShifts.length };
    }

    try {
      const batch = writeBatch(db);
      shiftsData.forEach(shiftData => {
        const docRef = doc(collection(db, SHIFTS_COLLECTION));
        batch.set(docRef, {
          ...shiftData,
          createdAt: new Date(),
        });
      });
      await batch.commit();
      return { success: true, count: shiftsData.length };
    } catch (error) {
      const newShifts = shiftsData.map((shiftData, index) => ({
        ...shiftData,
        id: `shift_${Date.now()}_${index}`,
        createdAt: new Date(),
      }));
      localStorageService.addShifts(newShifts);
      return { success: true, count: newShifts.length };
    }
  },

  // Update shift
  updateShift: async (id, updates) => {
    if (!isFirebaseConfigured()) {
      const success = localStorageService.updateShift(id, updates);
      return success
        ? { success: true }
        : { success: false, error: 'Shift not found' };
    }

    try {
      const shiftRef = doc(db, SHIFTS_COLLECTION, id);
      await updateDoc(shiftRef, {
        ...updates,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error) {
      const success = localStorageService.updateShift(id, updates);
      return success
        ? { success: true }
        : { success: false, error: error.message };
    }
  },

  // Delete shift
  deleteShift: async id => {
    if (!isFirebaseConfigured()) {
      localStorageService.deleteShift(id);
      return { success: true };
    }

    try {
      await deleteDoc(doc(db, SHIFTS_COLLECTION, id));
      return { success: true };
    } catch (error) {
      localStorageService.deleteShift(id);
      return { success: true };
    }
  },

  // Subscribe to shifts within date range
  subscribeToShifts: (startDate, endDate, callback) => {
    // For localStorage, we'll simulate subscription with polling
    if (!isFirebaseConfigured()) {
      console.log(
        'Using localStorage for shifts, date range:',
        startDate,
        'to',
        endDate
      );

      // Initial call
      const filteredShifts = localStorageService.getShiftsByDateRange(
        startDate,
        endDate
      );
      callback(filteredShifts);

      // Set up polling to detect changes (every 500ms)
      const interval = setInterval(() => {
        const shifts = localStorageService.getShiftsByDateRange(
          startDate,
          endDate
        );
        callback(shifts);
      }, 500);

      // Return cleanup function
      return () => clearInterval(interval);
    }

    try {
      // Convert dates to YYYY-MM-DD format for string comparison
      const startDateStr =
        typeof startDate === 'string'
          ? startDate
          : startDate.toISOString().split('T')[0];
      const endDateStr =
        typeof endDate === 'string'
          ? endDate
          : endDate.toISOString().split('T')[0];

      const q = query(
        collection(db, SHIFTS_COLLECTION),
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr)
      );

      return onSnapshot(
        q,
        snapshot => {
          const shifts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(shifts);
        },
        error => {
          console.warn(
            'Firebase subscription failed, using localStorage',
            error
          );
          const filteredShifts = localStorageService.getShiftsByDateRange(
            startDate,
            endDate
          );
          callback(filteredShifts);
        }
      );
    } catch (error) {
      console.warn('Firebase init failed, using localStorage');
      const filteredShifts = localStorageService.getShiftsByDateRange(
        startDate,
        endDate
      );
      callback(filteredShifts);
      return () => {};
    }
  },

  // Swap shifts
  swapShifts: async (shiftId1, shiftId2, employee1, employee2) => {
    if (!isFirebaseConfigured()) {
      const shifts = localStorageService.getShifts();
      const idx1 = shifts.findIndex(s => s.id === shiftId1);
      const idx2 = shifts.findIndex(s => s.id === shiftId2);

      if (idx1 !== -1 && idx2 !== -1) {
        localStorageService.updateShift(shiftId1, {
          employeeId: employee2.id,
          employeeName: employee2.name,
        });
        localStorageService.updateShift(shiftId2, {
          employeeId: employee1.id,
          employeeName: employee1.name,
        });
        return { success: true };
      }
      return { success: false, error: 'Shifts not found' };
    }

    try {
      const batch = writeBatch(db);

      const shiftRef1 = doc(db, SHIFTS_COLLECTION, shiftId1);
      const shiftRef2 = doc(db, SHIFTS_COLLECTION, shiftId2);

      batch.update(shiftRef1, {
        employeeId: employee2.id,
        employeeName: employee2.name,
        updatedAt: new Date(),
      });

      batch.update(shiftRef2, {
        employeeId: employee1.id,
        employeeName: employee1.name,
        updatedAt: new Date(),
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      const shifts = localStorageService.getShifts();
      const idx1 = shifts.findIndex(s => s.id === shiftId1);
      const idx2 = shifts.findIndex(s => s.id === shiftId2);

      if (idx1 !== -1 && idx2 !== -1) {
        localStorageService.updateShift(shiftId1, {
          employeeId: employee2.id,
          employeeName: employee2.name,
        });
        localStorageService.updateShift(shiftId2, {
          employeeId: employee1.id,
          employeeName: employee1.name,
        });
        return { success: true };
      }
      return { success: false, error: error.message };
    }
  },
};
