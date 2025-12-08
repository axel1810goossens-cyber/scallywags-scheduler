import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
  parseISO,
} from 'date-fns';

export const dateHelpers = {
  // Format date for display
  formatDate: (date, formatStr = 'MMM dd, yyyy') => {
    return format(date, formatStr);
  },

  // Format date for database (YYYY-MM-DD)
  formatDateForDB: date => {
    return format(date, 'yyyy-MM-dd');
  },

  // Parse date string
  parseDate: dateStr => {
    return parseISO(dateStr);
  },

  // Check if date is today
  isToday: date => {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getFullYear() === today.getFullYear() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getDate() === today.getDate()
    );
  },

  // Check if two dates are the same day
  isSameDay: (date1, date2) => {
    return isSameDay(date1, date2);
  },

  // Get week range
  getWeekRange: date => {
    return {
      start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
      end: endOfWeek(date, { weekStartsOn: 1 }),
    };
  },

  // Get month range
  getMonthRange: date => {
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  },

  // Get year range
  getYearRange: date => {
    return {
      start: startOfYear(date),
      end: endOfYear(date),
    };
  },

  // Get days in week
  getDaysInWeek: date => {
    const { start, end } = dateHelpers.getWeekRange(date);
    return eachDayOfInterval({ start, end });
  },

  // Get days in month
  getDaysInMonth: date => {
    const { start, end } = dateHelpers.getMonthRange(date);
    return eachDayOfInterval({ start, end });
  },

  // Get months in year
  getMonthsInYear: date => {
    const { start, end } = dateHelpers.getYearRange(date);
    return eachMonthOfInterval({ start, end });
  },

  // Navigation helpers
  nextDay: date => addDays(date, 1),
  prevDay: date => subDays(date, 1),
  nextWeek: date => addWeeks(date, 1),
  prevWeek: date => subWeeks(date, 1),
  nextMonth: date => addMonths(date, 1),
  prevMonth: date => subMonths(date, 1),
  nextYear: date => addYears(date, 1),
  prevYear: date => subYears(date, 1),

  // Get day name
  getDayName: (date, short = false) => {
    return format(date, short ? 'EEE' : 'EEEE');
  },

  // Get month name
  getMonthName: (date, short = false) => {
    return format(date, short ? 'MMM' : 'MMMM');
  },

  // Check if same month
  isSameMonth: (date1, date2) => {
    return isSameMonth(date1, date2);
  },
};
