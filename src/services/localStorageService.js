/**
 * Local Storage Service
 * Provides persistent storage for mock data using browser's localStorage
 * Data persists across browser refreshes but is local to each browser
 */

const STORAGE_KEYS = {
    EMPLOYEES: 'scallywags_employees',
    SHIFTS: 'scallywags_shifts',
    SETTINGS: 'scallywags_settings',
    INITIALIZED: 'scallywags_initialized'
};

export const localStorageService = {
    // Initialize storage with default data if not already initialized
    // Initialize storage with default data if not already initialized
    initialize: (defaultEmployees, defaultShifts, defaultSettings) => {
        // Only initialize if provided and not already in storage
        if (defaultEmployees && !localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
            console.log('Initializing employees...');
            localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(defaultEmployees));
        }

        if (defaultShifts && !localStorage.getItem(STORAGE_KEYS.SHIFTS)) {
            console.log('Initializing shifts...');
            localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(defaultShifts));
        }

        if (defaultSettings && !localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
            console.log('Initializing settings...');
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        }

        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    },

    // Employees
    getEmployees: () => {
        const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
        return data ? JSON.parse(data) : [];
    },

    setEmployees: (employees) => {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    },

    addEmployee: (employee) => {
        const employees = localStorageService.getEmployees();
        employees.push(employee);
        localStorageService.setEmployees(employees);
    },

    updateEmployee: (id, updates) => {
        const employees = localStorageService.getEmployees();
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...updates };
            localStorageService.setEmployees(employees);
            return true;
        }
        return false;
    },

    deleteEmployee: (id) => {
        const employees = localStorageService.getEmployees();
        const filtered = employees.filter(e => e.id !== id);
        localStorageService.setEmployees(filtered);
    },

    // Shifts
    getShifts: () => {
        const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
        return data ? JSON.parse(data) : [];
    },

    setShifts: (shifts) => {
        localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
    },

    addShift: (shift) => {
        const shifts = localStorageService.getShifts();
        shifts.push(shift);
        localStorageService.setShifts(shifts);
    },

    addShifts: (newShifts) => {
        const shifts = localStorageService.getShifts();
        shifts.push(...newShifts);
        localStorageService.setShifts(shifts);
    },

    updateShift: (id, updates) => {
        const shifts = localStorageService.getShifts();
        const index = shifts.findIndex(s => s.id === id);
        if (index !== -1) {
            shifts[index] = { ...shifts[index], ...updates };
            localStorageService.setShifts(shifts);
            return true;
        }
        return false;
    },

    deleteShift: (id) => {
        const shifts = localStorageService.getShifts();
        const filtered = shifts.filter(s => s.id !== id);
        localStorageService.setShifts(filtered);
    },

    getShiftsByDateRange: (startDate, endDate) => {
        const shifts = localStorageService.getShifts();
        return shifts.filter(s => s.date >= startDate && s.date <= endDate);
    },

    // Settings
    getSettings: () => {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? JSON.parse(data) : null;
    },

    setSettings: (settings) => {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },

    // Utility
    clearAll: () => {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('Local storage cleared');
    },

    exportData: () => {
        return {
            employees: localStorageService.getEmployees(),
            shifts: localStorageService.getShifts(),
            settings: localStorageService.getSettings()
        };
    },

    importData: (data) => {
        if (data.employees) localStorageService.setEmployees(data.employees);
        if (data.shifts) localStorageService.setShifts(data.shifts);
        if (data.settings) localStorageService.setSettings(data.settings);
        console.log('Data imported successfully');
    }
};
