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
import { localStorageService } from './localStorageService';

const SHIFTS_COLLECTION = 'shifts';

export const shiftService = {
  // Add new shift
  addShift: async shiftData => {
    try {
      const docRef = await addDoc(collection(db, SHIFTS_COLLECTION), {
        ...shiftData,
        createdAt: new Date(),
      });
      // Invalidate cache on write
      localStorageService.invalidateShiftsCache();
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding shift:', error);
      return { success: false, error: error.message };
    }
  },

  // Batch add multiple shifts
  batchAddShifts: async shiftsData => {
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
      // Invalidate cache on write
      localStorageService.invalidateShiftsCache();
      return { success: true, count: shiftsData.length };
    } catch (error) {
      console.error('Error batch adding shifts:', error);
      return { success: false, error: error.message };
    }
  },

  // Update shift
  updateShift: async (id, updates) => {
    try {
      const shiftRef = doc(db, SHIFTS_COLLECTION, id);
      await updateDoc(shiftRef, {
        ...updates,
        updatedAt: new Date(),
      });
      // Invalidate cache on write
      localStorageService.invalidateShiftsCache();
      return { success: true };
    } catch (error) {
      console.error('Error updating shift:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete shift
  deleteShift: async id => {
    try {
      await deleteDoc(doc(db, SHIFTS_COLLECTION, id));
      // Invalidate cache on write
      localStorageService.invalidateShiftsCache();
      return { success: true };
    } catch (error) {
      console.error('Error deleting shift:', error);
      return { success: false, error: error.message };
    }
  },

  // Subscribe to shifts within date range
  subscribeToShifts: (startDate, endDate, callback) => {
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

  // Swap shifts
  swapShifts: async (shiftId1, shiftId2, employee1, employee2) => {
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
      // Invalidate cache on write
      localStorageService.invalidateShiftsCache();
      return { success: true };
    } catch (error) {
      console.error('Error swapping shifts:', error);
      return { success: false, error: error.message };
    }
  },
};
