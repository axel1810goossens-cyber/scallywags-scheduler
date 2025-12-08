/**
 * Local Storage Cache Service
 * Provides caching layer for Firestore data to reduce network requests
 * Cache is invalidated after a certain time or can be manually cleared
 */

const STORAGE_KEYS = {
  EMPLOYEES: 'scallywags_cache_employees',
  SHIFTS: 'scallywags_cache_shifts',
  SETTINGS: 'scallywags_cache_settings',
  EMPLOYEES_TIMESTAMP: 'scallywags_cache_employees_ts',
  SHIFTS_TIMESTAMP: 'scallywags_cache_shifts_ts',
  SETTINGS_TIMESTAMP: 'scallywags_cache_settings_ts',
};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export const localStorageService = {
  // Check if cache is still valid
  isCacheValid: timestampKey => {
    const timestamp = localStorage.getItem(timestampKey);
    if (!timestamp) return false;

    const age = Date.now() - parseInt(timestamp, 10);
    return age < CACHE_EXPIRATION;
  },

  // Update cache timestamp
  updateTimestamp: timestampKey => {
    localStorage.setItem(timestampKey, Date.now().toString());
  },

  // Employees Cache
  getCachedEmployees: () => {
    if (!localStorageService.isCacheValid(STORAGE_KEYS.EMPLOYEES_TIMESTAMP)) {
      return null;
    }
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : null;
  },

  setCachedEmployees: employees => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    localStorageService.updateTimestamp(STORAGE_KEYS.EMPLOYEES_TIMESTAMP);
  },

  invalidateEmployeesCache: () => {
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES_TIMESTAMP);
  },

  // Shifts Cache
  getCachedShifts: (startDate, endDate) => {
    if (!localStorageService.isCacheValid(STORAGE_KEYS.SHIFTS_TIMESTAMP)) {
      return null;
    }
    const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    if (!data) return null;

    const allShifts = JSON.parse(data);

    // If date range specified, filter
    if (startDate && endDate) {
      const start =
        typeof startDate === 'string'
          ? startDate
          : startDate.toISOString().split('T')[0];
      const end =
        typeof endDate === 'string'
          ? endDate
          : endDate.toISOString().split('T')[0];

      return allShifts.filter(shift => {
        const shiftDate =
          typeof shift.date === 'string'
            ? shift.date
            : shift.date.toISOString().split('T')[0];
        return shiftDate >= start && shiftDate <= end;
      });
    }

    return allShifts;
  },

  setCachedShifts: shifts => {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    localStorageService.updateTimestamp(STORAGE_KEYS.SHIFTS_TIMESTAMP);
  },

  invalidateShiftsCache: () => {
    localStorage.removeItem(STORAGE_KEYS.SHIFTS);
    localStorage.removeItem(STORAGE_KEYS.SHIFTS_TIMESTAMP);
  },

  // Settings Cache
  getCachedSettings: () => {
    if (!localStorageService.isCacheValid(STORAGE_KEYS.SETTINGS_TIMESTAMP)) {
      return null;
    }
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  setCachedSettings: settings => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    localStorageService.updateTimestamp(STORAGE_KEYS.SETTINGS_TIMESTAMP);
  },

  invalidateSettingsCache: () => {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS_TIMESTAMP);
  },

  // Clear all cache
  clearAllCache: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};
