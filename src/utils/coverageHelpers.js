import { dateHelpers } from './dateHelpers';

export const coverageHelpers = {
  // Calculate daily coverage status
  validateDailyCoverage: (date, shifts, settings) => {
    if (!settings || !settings.requirements)
      return { status: 'unknown', issues: [] };

    const dayName = dateHelpers.getDayName(date).toLowerCase();
    const dayHours = settings.openingHours[dayName];

    if (dayHours.closed) {
      return {
        status: 'closed',
        message: 'Restaurant is closed today',
        issues: [],
      };
    }

    const issues = [];
    const stats = {};

    // Initialize stats for each required position
    Object.keys(settings.requirements).forEach(pos => {
      stats[pos] = { count: 0, hours: 0 };
    });

    // Calculate actuals from shifts
    shifts.forEach(shift => {
      if (!shift.position) return;

      // Normalize position name (case-insensitive check could be added)
      const pos = shift.position;

      if (!stats[pos]) {
        stats[pos] = { count: 0, hours: 0 };
      }

      stats[pos].count += 1;

      // Calculate hours
      // Assuming simplified hour calculation for now (start - end)
      // In a real app, we'd handle cross-midnight shifts more carefully
      const start = parseInt(shift.startTime.split(':')[0]);
      let end = parseInt(shift.endTime.split(':')[0]);
      if (end < start) end += 24; // Handle overnight

      stats[pos].hours += end - start;
    });

    // Compare against requirements
    Object.entries(settings.requirements).forEach(([pos, req]) => {
      const actual = stats[pos] || { count: 0, hours: 0 };

      if (actual.count < req.minCount) {
        issues.push({
          type: 'error',
          message: `Need ${req.minCount - actual.count} more ${pos}(s)`,
        });
      }

      if (actual.hours < req.minHours) {
        issues.push({
          type: 'warning',
          message: `${pos} hours low (${actual.hours}/${req.minHours})`,
        });
      }
    });

    // Determine overall status
    let status = 'optimal';
    if (issues.some(i => i.type === 'error')) status = 'critical';
    else if (issues.some(i => i.type === 'warning')) status = 'warning';

    return {
      status,
      issues,
      stats,
    };
  },
};
