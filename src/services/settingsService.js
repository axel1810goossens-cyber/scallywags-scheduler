import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { localStorageService } from './localStorageService';

// Default settings if none exist
const defaultSettings = {
  openingHours: {
    monday: { open: '11:00', close: '04:00', closed: false },
    tuesday: { open: '11:00', close: '04:00', closed: false },
    wednesday: { open: '11:00', close: '04:00', closed: false },
    thursday: { open: '11:00', close: '04:00', closed: false },
    friday: { open: '11:00', close: '04:00', closed: false },
    saturday: { open: '11:00', close: '04:00', closed: false },
    sunday: { open: '12:00', close: '04:00', closed: false },
  },
  requirements: {
    Server: { minCount: 2, minHours: 8 },
    Bartender: { minCount: 1, minHours: 8 },
    Kitchen: { minCount: 2, minHours: 8 },
    Host: { minCount: 1, minHours: 6 },
    Manager: { minCount: 1, minHours: 8 },
  },
};

export const settingsService = {
  getSettings: async () => {
    // Check cache first
    const cached = localStorageService.getCachedSettings();
    if (cached) {
      return { success: true, data: { ...defaultSettings, ...cached } };
    }

    if (!db) {
      return {
        success: false,
        error: 'Database not configured. Please login first.',
      };
    }

    try {
      const docRef = doc(db, 'settings', 'general');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const settings = { ...defaultSettings, ...docSnap.data() };
        // Cache the result
        localStorageService.setCachedSettings(settings);
        return { success: true, data: settings };
      } else {
        // Initialize if not exists
        await setDoc(docRef, defaultSettings);
        localStorageService.setCachedSettings(defaultSettings);
        return { success: true, data: defaultSettings };
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      return { success: false, error: error.message };
    }
  },

  updateSettings: async newSettings => {
    if (!db) {
      return {
        success: false,
        error: 'Database not configured. Please login first.',
      };
    }
    try {
      const docRef = doc(db, 'settings', 'general');
      await updateDoc(docRef, newSettings);
      // Invalidate cache on write
      localStorageService.invalidateSettingsCache();
      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
  },
};
