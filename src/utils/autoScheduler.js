import { dateHelpers } from './dateHelpers';

/**
 * Auto-generates shifts for a given date based on employee availability and requirements
 * @param {Date} date - The date to generate shifts for
 * @param {Array} employees - List of all employees
 * @param {Object} settings - Restaurant settings (opening hours, requirements)
 * @returns {Array} - Array of generated shift objects
 */
export const generateDailySchedule = (date, employees, settings) => {
  const dayName = dateHelpers.getDayName(date).toLowerCase();
  const dayHours = settings.openingHours[dayName];

  if (dayHours.closed) {
    return [];
  }

  const generatedShifts = [];
  const dateStr = dateHelpers.formatDateForDB(date);

  // Get requirements for each position
  const requirements = settings.requirements;

  // Filter employees by availability for this day
  const availableEmployees = employees.filter(emp => {
    return (
      emp.availability &&
      emp.availability[dayName] &&
      emp.availability[dayName].length > 0
    );
  });

  // Group employees by position
  const employeesByPosition = {};
  availableEmployees.forEach(emp => {
    if (!employeesByPosition[emp.position]) {
      employeesByPosition[emp.position] = [];
    }
    employeesByPosition[emp.position].push(emp);
  });

  // Track assigned employees to prevent double-booking
  const assignedEmployeeIds = new Set();

  // Generate shifts for each position based on requirements
  Object.entries(requirements).forEach(([position, req]) => {
    const positionEmployees = employeesByPosition[position] || [];

    if (positionEmployees.length === 0) {
      return;
    }

    // Filter out already assigned employees
    const unassignedEmployees = positionEmployees.filter(
      emp => !assignedEmployeeIds.has(emp.id)
    );

    if (unassignedEmployees.length === 0) {
      return;
    }

    // Calculate shift duration to meet minimum hours
    const shiftDuration = Math.ceil(req.minHours / req.minCount);

    // Distribute shifts among available employees
    for (let i = 0; i < req.minCount && i < unassignedEmployees.length; i++) {
      const employee = unassignedEmployees[i];

      // Skip if employee doesn't have availability for this day
      if (
        !employee.availability ||
        !employee.availability[dayName] ||
        employee.availability[dayName].length === 0
      ) {
        continue;
      }

      const availability = employee.availability[dayName][0]; // Use first availability slot

      // Parse availability times
      const availStart = availability.start;
      const availEnd = availability.end;

      // Calculate shift times within availability
      let shiftStart = availStart;
      let shiftEnd = calculateEndTime(availStart, shiftDuration);

      // Ensure shift doesn't exceed availability
      if (compareTime(shiftEnd, availEnd) > 0) {
        shiftEnd = availEnd;
      }

      // Double-check employee isn't already assigned (defensive programming)
      if (assignedEmployeeIds.has(employee.id)) {
        continue;
      }

      generatedShifts.push({
        employeeId: employee.id,
        employeeName: employee.name,
        position: employee.position,
        date: dateStr,
        startTime: shiftStart,
        endTime: shiftEnd,
        notes: 'Auto-generated',
      });

      // Mark employee as assigned
      assignedEmployeeIds.add(employee.id);
    }
  });

  return generatedShifts;
};

/**
 * Generate shifts for an entire week
 */
export const generateWeeklySchedule = (startDate, employees, settings) => {
  const allShifts = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const dailyShifts = generateDailySchedule(date, employees, settings);
    allShifts.push(...dailyShifts);
  }

  return allShifts;
};

// Helper function to calculate end time given start time and duration in hours
function calculateEndTime(startTime, durationHours) {
  const [hours, minutes] = startTime.split(':').map(Number);
  let endHours = hours + durationHours;
  let endMinutes = minutes;

  // Handle overflow past 24 hours
  if (endHours >= 24) {
    endHours = endHours % 24;
  }

  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

// Helper function to compare two time strings (HH:MM format)
function compareTime(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);

  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;

  return minutes1 - minutes2;
}
