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
        sunday: { open: '12:00', close: '04:00', closed: false }
    },
    requirements: {
        Server: { minCount: 2, minHours: 8 },
        Bartender: { minCount: 1, minHours: 8 },
        Kitchen: { minCount: 2, minHours: 8 },
        Host: { minCount: 1, minHours: 6 },
        Manager: { minCount: 1, minHours: 8 }
    }
};

// Initialize localStorage with default settings
localStorageService.initialize(null, null, defaultSettings);

const isFirebaseConfigured = () => {
    try {
        return db && import.meta.env.VITE_FIREBASE_API_KEY !== 'your-api-key-here';
    } catch {
        return false;
    }
};

export const settingsService = {
    getSettings: async () => {
        if (!isFirebaseConfigured()) {
            const settings = localStorageService.getSettings();
            // Merge with defaults to ensure all keys exist
            return { success: true, data: { ...defaultSettings, ...settings } };
        }

        try {
            const docRef = doc(db, 'settings', 'general');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Merge with defaults to ensure all keys exist
                return { success: true, data: { ...defaultSettings, ...docSnap.data() } };
            } else {
                // Initialize if not exists
                await setDoc(docRef, defaultSettings);
                return { success: true, data: defaultSettings };
            }
        } catch (error) {
            console.warn('Firebase settings fetch failed, using localStorage', error);
            const settings = localStorageService.getSettings();
            return { success: true, data: { ...defaultSettings, ...settings } };
        }
    },

    updateSettings: async (newSettings) => {
        if (!isFirebaseConfigured()) {
            const currentSettings = localStorageService.getSettings() || defaultSettings;
            const updatedSettings = { ...currentSettings, ...newSettings };
            localStorageService.setSettings(updatedSettings);
            return { success: true };
        }

        try {
            const docRef = doc(db, 'settings', 'general');
            await updateDoc(docRef, newSettings);
            return { success: true };
        } catch (error) {
            console.warn('Firebase settings update failed, using localStorage', error);
            const currentSettings = localStorageService.getSettings() || defaultSettings;
            const updatedSettings = { ...currentSettings, ...newSettings };
            localStorageService.setSettings(updatedSettings);
            return { success: true };
        }
    }
};
