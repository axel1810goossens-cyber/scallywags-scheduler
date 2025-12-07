import { useShifts } from '../../hooks/useShifts';
import { dateHelpers } from '../../utils/dateHelpers';
import './YearlyView.scss';

const YearlyView = ({ currentDate, onMonthSelect }) => {
    const { start, end } = dateHelpers.getYearRange(currentDate);
    const startStr = dateHelpers.formatDateForDB(start);
    const endStr = dateHelpers.formatDateForDB(end);
    const { shifts, loading } = useShifts(startStr, endStr);

    const months = dateHelpers.getMonthsInYear(currentDate);

    const getShiftsForMonth = (monthDate) => {
        const monthStart = dateHelpers.getMonthRange(monthDate).start;
        const monthEnd = dateHelpers.getMonthRange(monthDate).end;

        // Filter shifts that fall within this month
        return shifts.filter(shift => {
            const shiftDate = dateHelpers.parseDate(shift.date);
            return shiftDate >= monthStart && shiftDate <= monthEnd;
        });
    };

    const getHeatmapClass = (count) => {
        if (count === 0) return 'level-0';
        if (count < 10) return 'level-1';
        if (count < 30) return 'level-2';
        if (count < 60) return 'level-3';
        return 'level-4';
    };

    if (loading) {
        return (
            <div className="yearly-view-loading">
                <div className="spinner"></div>
                <p>Loading yearly overview...</p>
            </div>
        );
    }

    return (
        <div className="yearly-view">
            <div className="year-grid">
                {months.map((month) => {
                    const monthShifts = getShiftsForMonth(month);
                    const shiftCount = monthShifts.length;
                    const isCurrentMonth = dateHelpers.isSameMonth(month, new Date());

                    return (
                        <div
                            key={month.toISOString()}
                            className={`month-card ${isCurrentMonth ? 'current' : ''}`}
                            onClick={() => onMonthSelect(month)}
                        >
                            <div className="month-header">
                                <h4>{dateHelpers.formatDate(month, 'MMMM')}</h4>
                                <span className="shift-count">{shiftCount} shifts</span>
                            </div>

                            <div className="month-mini-grid">
                                {/* Simplified visual representation of the month */}
                                {dateHelpers.getDaysInMonth(month).map(day => {
                                    // Check if this day has shifts
                                    const dayStr = dateHelpers.formatDateForDB(day);
                                    const dayHasShifts = monthShifts.some(s => s.date === dayStr);

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`mini-day ${dayHasShifts ? 'has-shifts' : ''}`}
                                        ></div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default YearlyView;
