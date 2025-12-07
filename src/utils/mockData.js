import { addDays, startOfWeek, format } from 'date-fns';

const today = new Date();
const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });

export const mockEmployees = [
    {
        id: 'emp_1',
        name: 'Sarah Jenkins',
        email: 'sarah.j@scallywags.com',
        phone: '+1 (555) 123-4567',
        position: 'Server',
        availability: {
            monday: [{ start: '11:00', end: '04:00' }],
            tuesday: [{ start: '11:00', end: '04:00' }],
            wednesday: [{ start: '11:00', end: '04:00' }],
            thursday: [{ start: '11:00', end: '04:00' }],
            friday: [{ start: '11:00', end: '04:00' }]
        }
    },
    {
        id: 'emp_2',
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
        id: 'emp_3',
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
    },
    {
        id: 'emp_4',
        name: 'Louis Litt',
        email: 'louis.l@scallywags.com',
        phone: '+1 (555) 456-7890',
        position: 'Kitchen',
        availability: {
            monday: [{ start: '10:00', end: '00:00' }],
            wednesday: [{ start: '10:00', end: '00:00' }],
            friday: [{ start: '10:00', end: '02:00' }],
            saturday: [{ start: '10:00', end: '02:00' }]
        }
    },
    {
        id: 'emp_5',
        name: 'Rachel Zane',
        email: 'rachel.z@scallywags.com',
        phone: '+1 (555) 567-8901',
        position: 'Host',
        availability: {
            friday: [{ start: '17:00', end: '02:00' }],
            saturday: [{ start: '11:00', end: '02:00' }],
            sunday: [{ start: '11:00', end: '02:00' }]
        }
    }
];

// Generate comprehensive shifts for the current week based on 11am-4am hours
export const mockShifts = [
    // Monday
    {
        id: 'shift_1',
        employeeId: 'emp_1',
        employeeName: 'Sarah Jenkins',
        position: 'Server',
        date: format(addDays(startOfCurrentWeek, 0), 'yyyy-MM-dd'),
        startTime: '11:00',
        endTime: '19:00',
        notes: 'Day shift'
    },
    {
        id: 'shift_2',
        employeeId: 'emp_3',
        employeeName: 'Jessica Pearson',
        position: 'Manager',
        date: format(addDays(startOfCurrentWeek, 0), 'yyyy-MM-dd'),
        startTime: '10:00',
        endTime: '18:00',
        notes: 'Opening Manager'
    },
    {
        id: 'shift_3',
        employeeId: 'emp_4',
        employeeName: 'Louis Litt',
        position: 'Kitchen',
        date: format(addDays(startOfCurrentWeek, 0), 'yyyy-MM-dd'),
        startTime: '11:00',
        endTime: '20:00',
        notes: 'Lunch/Dinner prep'
    },

    // Tuesday
    {
        id: 'shift_4',
        employeeId: 'emp_1',
        employeeName: 'Sarah Jenkins',
        position: 'Server',
        date: format(addDays(startOfCurrentWeek, 1), 'yyyy-MM-dd'),
        startTime: '19:00',
        endTime: '03:00',
        notes: 'Late night'
    },
    {
        id: 'shift_5',
        employeeId: 'emp_3',
        employeeName: 'Jessica Pearson',
        position: 'Manager',
        date: format(addDays(startOfCurrentWeek, 1), 'yyyy-MM-dd'),
        startTime: '14:00',
        endTime: '22:00',
        notes: 'Mid shift'
    },

    // Wednesday
    {
        id: 'shift_6',
        employeeId: 'emp_4',
        employeeName: 'Louis Litt',
        position: 'Kitchen',
        date: format(addDays(startOfCurrentWeek, 2), 'yyyy-MM-dd'),
        startTime: '16:00',
        endTime: '00:00',
        notes: 'Dinner service'
    },
    {
        id: 'shift_7',
        employeeId: 'emp_1',
        employeeName: 'Sarah Jenkins',
        position: 'Server',
        date: format(addDays(startOfCurrentWeek, 2), 'yyyy-MM-dd'),
        startTime: '11:00',
        endTime: '19:00',
        notes: 'Day shift'
    },
    {
        id: 'shift_8',
        employeeId: 'emp_3',
        employeeName: 'Jessica Pearson',
        position: 'Manager',
        date: format(addDays(startOfCurrentWeek, 2), 'yyyy-MM-dd'),
        startTime: '10:00',
        endTime: '18:00',
        notes: ''
    },

    // Thursday
    {
        id: 'shift_9',
        employeeId: 'emp_2',
        employeeName: 'Mike Ross',
        position: 'Bartender',
        date: format(addDays(startOfCurrentWeek, 3), 'yyyy-MM-dd'),
        startTime: '20:00',
        endTime: '04:00',
        notes: 'Closing bar'
    },
    {
        id: 'shift_10',
        employeeId: 'emp_1',
        employeeName: 'Sarah Jenkins',
        position: 'Server',
        date: format(addDays(startOfCurrentWeek, 3), 'yyyy-MM-dd'),
        startTime: '18:00',
        endTime: '02:00',
        notes: 'Evening shift'
    },
    {
        id: 'shift_11',
        employeeId: 'emp_3',
        employeeName: 'Jessica Pearson',
        position: 'Manager',
        date: format(addDays(startOfCurrentWeek, 3), 'yyyy-MM-dd'),
        startTime: '12:00',
        endTime: '20:00',
        notes: ''
    },

    // Friday
    {
        id: 'shift_12',
        employeeId: 'emp_1',
        employeeName: 'Sarah Jenkins',
        position: 'Server',
        date: format(addDays(startOfCurrentWeek, 4), 'yyyy-MM-dd'),
        startTime: '19:00',
        endTime: '04:00',
        notes: 'Busy night close'
    },
    {
        id: 'shift_13',
        employeeId: 'emp_2',
        employeeName: 'Mike Ross',
        position: 'Bartender',
        date: format(addDays(startOfCurrentWeek, 4), 'yyyy-MM-dd'),
        startTime: '20:00',
        endTime: '04:00',
        notes: 'Closing bar'
    },
    {
        id: 'shift_14',
        employeeId: 'emp_5',
        employeeName: 'Rachel Zane',
        position: 'Host',
        date: format(addDays(startOfCurrentWeek, 4), 'yyyy-MM-dd'),
        startTime: '18:00',
        endTime: '02:00',
        notes: 'Evening host'
    },
    {
        id: 'shift_15',
        employeeId: 'emp_4',
        employeeName: 'Louis Litt',
        position: 'Kitchen',
        date: format(addDays(startOfCurrentWeek, 4), 'yyyy-MM-dd'),
        startTime: '16:00',
        endTime: '02:00',
        notes: 'Late night food'
    },
    {
        id: 'shift_16',
        employeeId: 'emp_3',
        employeeName: 'Jessica Pearson',
        position: 'Manager',
        date: format(addDays(startOfCurrentWeek, 4), 'yyyy-MM-dd'),
        startTime: '16:00',
        endTime: '02:00',
        notes: 'Closing manager'
    },

    // Saturday
    {
        id: 'shift_17',
        employeeId: 'emp_2',
        employeeName: 'Mike Ross',
        position: 'Bartender',
        date: format(addDays(startOfCurrentWeek, 5), 'yyyy-MM-dd'),
        startTime: '20:00',
        endTime: '04:00',
        notes: 'Saturday night fever'
    },
    {
        id: 'shift_18',
        employeeId: 'emp_5',
        employeeName: 'Rachel Zane',
        position: 'Host',
        date: format(addDays(startOfCurrentWeek, 5), 'yyyy-MM-dd'),
        startTime: '11:00',
        endTime: '19:00',
        notes: 'Day host'
    },
    {
        id: 'shift_19',
        employeeId: 'emp_4',
        employeeName: 'Louis Litt',
        position: 'Kitchen',
        date: format(addDays(startOfCurrentWeek, 5), 'yyyy-MM-dd'),
        startTime: '12:00',
        endTime: '22:00',
        notes: 'All day prep'
    },

    // Sunday
    {
        id: 'shift_20',
        employeeId: 'emp_2',
        employeeName: 'Mike Ross',
        position: 'Bartender',
        date: format(addDays(startOfCurrentWeek, 6), 'yyyy-MM-dd'),
        startTime: '12:00',
        endTime: '20:00',
        notes: 'Sunday Funday'
    },
    {
        id: 'shift_21',
        employeeId: 'emp_5',
        employeeName: 'Rachel Zane',
        position: 'Host',
        date: format(addDays(startOfCurrentWeek, 6), 'yyyy-MM-dd'),
        startTime: '12:00',
        endTime: '20:00',
        notes: ''
    }
];
