import { useShifts } from '../../hooks/useShifts';
import { dateHelpers } from '../../utils/dateHelpers';
import ShiftCard from '../shifts/ShiftCard';
import './WeeklyView.scss';

const WeeklyView = ({ currentDate }) => {
    const { start, end } = dateHelpers.getWeekRange(currentDate);
    const startStr = dateHelpers.formatDateForDB(start);
    const endStr = dateHelpers.formatDateForDB(end);
    const { shifts, loading } = useShifts(startStr, endStr);

    const daysInWeek = dateHelpers.getDaysInWeek(currentDate);

    const getShiftsForDay = (date) => {
        const dateStr = dateHelpers.formatDateForDB(date);
        return shifts.filter(shift => shift.date === dateStr);
    };

    if (loading) {
        return (
            <div className="weekly-view-loading">
                <div className="spinner"></div>
                <p>Loading weekly schedule...</p>
            </div>
        );
    }

    return (
        <div className="weekly-view">
            <div className="week-grid">
                {daysInWeek.map((day) => {
                    const dayShifts = getShiftsForDay(day);
                    const isToday = dateHelpers.isToday(day);

                    return (
                        <div key={day.toISOString()} className={`day-column ${isToday ? 'today' : ''}`}>
                            <div className="day-header">
                                <div className="day-name">{dateHelpers.getDayName(day, true)}</div>
                                <div className="day-date">{dateHelpers.formatDate(day, 'dd')}</div>
                                {isToday && <div className="today-label">Today</div>}
                            </div>

                            <div className="day-shifts">
                                {dayShifts.length === 0 ? (
                                    <div className="no-shifts">No shifts</div>
                                ) : (
                                    dayShifts.map((shift) => (
                                        <ShiftCard key={shift.id} shift={shift} compact />
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyView;
