import { useShifts } from '../../hooks/useShifts';
import { dateHelpers } from '../../utils/dateHelpers';
import './MonthlyView.scss';

const MonthlyView = ({ currentDate, onDateSelect }) => {
  const { start, end } = dateHelpers.getMonthRange(currentDate);
  const startStr = dateHelpers.formatDateForDB(start);
  const endStr = dateHelpers.formatDateForDB(end);
  const { shifts, loading } = useShifts(startStr, endStr);

  const daysInMonth = dateHelpers.getDaysInMonth(currentDate);

  // Get first day of month to calculate offset
  const firstDayOfMonth = daysInMonth[0];
  const dayOfWeek = firstDayOfMonth.getDay();
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0

  const getShiftsForDay = date => {
    const dateStr = dateHelpers.formatDateForDB(date);
    return shifts.filter(shift => shift.date === dateStr);
  };

  const handleDayClick = day => {
    onDateSelect(day);
  };

  if (loading) {
    return (
      <div className="monthly-view-loading">
        <div className="spinner"></div>
        <p>Loading monthly schedule...</p>
      </div>
    );
  }

  return (
    <div className="monthly-view">
      <div className="month-grid">
        {/* Day headers */}
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}

        {/* Empty cells for offset */}
        {Array.from({ length: offset }).map((_, index) => (
          <div key={`empty-${index}`} className="day-cell empty"></div>
        ))}

        {/* Days of month */}
        {daysInMonth.map(day => {
          const dayShifts = getShiftsForDay(day);
          const isToday = dateHelpers.isToday(day);
          const isCurrentMonth = dateHelpers.isSameMonth(day, currentDate);

          return (
            <div
              key={day.toISOString()}
              className={`day-cell ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="day-number">
                {dateHelpers.formatDate(day, 'd')}
                {isToday && <span className="today-label">Today</span>}
              </div>

              {dayShifts.length > 0 && (
                <div className="shift-indicators">
                  {dayShifts.slice(0, 3).map(shift => (
                    <div
                      key={shift.id}
                      className="shift-indicator"
                      title={`${shift.employeeName}: ${shift.startTime}-${shift.endTime}`}
                    >
                      <span className="shift-name">{shift.employeeName}</span>
                      <span className="shift-time">{shift.startTime}</span>
                    </div>
                  ))}
                  {dayShifts.length > 3 && (
                    <div className="more-shifts">
                      +{dayShifts.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyView;
