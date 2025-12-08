export const validators = {
  // Email validation
  isValidEmail: email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone validation (basic)
  isValidPhone: phone => {
    const phoneRegex = /^[\d\s\-+()]+$/;
    return phone.length >= 10 && phoneRegex.test(phone);
  },

  // Time validation (HH:MM format)
  isValidTime: time => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },

  // Check if end time is after start time
  isValidTimeRange: (startTime, endTime) => {
    if (
      !validators.isValidTime(startTime) ||
      !validators.isValidTime(endTime)
    ) {
      return false;
    }

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes > startMinutes;
  },

  // Check if shift conflicts with employee availability
  checkAvailabilityConflict: (employee, dayOfWeek, startTime, endTime) => {
    if (!employee.availability || !employee.availability[dayOfWeek]) {
      return {
        hasConflict: true,
        message: 'Employee not available on this day',
      };
    }

    const availableSlots = employee.availability[dayOfWeek];

    for (const slot of availableSlots) {
      if (
        validators.isTimeWithinRange(startTime, endTime, slot.start, slot.end)
      ) {
        return { hasConflict: false };
      }
    }

    return {
      hasConflict: true,
      message: 'Shift time outside employee availability',
    };
  },

  // Check if a time range is within another time range
  isTimeWithinRange: (checkStart, checkEnd, rangeStart, rangeEnd) => {
    const [checkStartHour, checkStartMin] = checkStart.split(':').map(Number);
    const [checkEndHour, checkEndMin] = checkEnd.split(':').map(Number);
    const [rangeStartHour, rangeStartMin] = rangeStart.split(':').map(Number);
    const [rangeEndHour, rangeEndMin] = rangeEnd.split(':').map(Number);

    const checkStartMinutes = checkStartHour * 60 + checkStartMin;
    const checkEndMinutes = checkEndHour * 60 + checkEndMin;
    const rangeStartMinutes = rangeStartHour * 60 + rangeStartMin;
    const rangeEndMinutes = rangeEndHour * 60 + rangeEndMin;

    return (
      checkStartMinutes >= rangeStartMinutes &&
      checkEndMinutes <= rangeEndMinutes
    );
  },

  // Required field validation
  isRequired: value => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  // Min length validation
  minLength: (value, min) => {
    return value.length >= min;
  },

  // Max length validation
  maxLength: (value, max) => {
    return value.length <= max;
  },
};
