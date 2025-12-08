import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { dateHelpers } from '../../utils/dateHelpers';
import DailyView from './DailyView';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';
import YearlyView from './YearlyView';
import './CalendarView.scss';

const VIEW_MODES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(VIEW_MODES.DAILY);

  const handlePrevious = () => {
    switch (viewMode) {
      case VIEW_MODES.DAILY:
        setCurrentDate(dateHelpers.prevDay(currentDate));
        break;
      case VIEW_MODES.WEEKLY:
        setCurrentDate(dateHelpers.prevWeek(currentDate));
        break;
      case VIEW_MODES.MONTHLY:
        setCurrentDate(dateHelpers.prevMonth(currentDate));
        break;
      case VIEW_MODES.YEARLY:
        setCurrentDate(dateHelpers.prevYear(currentDate));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case VIEW_MODES.DAILY:
        setCurrentDate(dateHelpers.nextDay(currentDate));
        break;
      case VIEW_MODES.WEEKLY:
        setCurrentDate(dateHelpers.nextWeek(currentDate));
        break;
      case VIEW_MODES.MONTHLY:
        setCurrentDate(dateHelpers.nextMonth(currentDate));
        break;
      case VIEW_MODES.YEARLY:
        setCurrentDate(dateHelpers.nextYear(currentDate));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeText = () => {
    switch (viewMode) {
      case VIEW_MODES.DAILY:
        return dateHelpers.formatDate(currentDate, 'EEEE, MMMM dd, yyyy');
      case VIEW_MODES.WEEKLY: {
        const { start, end } = dateHelpers.getWeekRange(currentDate);
        return `${dateHelpers.formatDate(start, 'MMM dd')} - ${dateHelpers.formatDate(end, 'MMM dd, yyyy')}`;
      }
      case VIEW_MODES.MONTHLY:
        return dateHelpers.formatDate(currentDate, 'MMMM yyyy');
      case VIEW_MODES.YEARLY:
        return dateHelpers.formatDate(currentDate, 'yyyy');
      default:
        return '';
    }
  };

  const renderView = () => {
    switch (viewMode) {
      case VIEW_MODES.DAILY:
        return <DailyView currentDate={currentDate} />;
      case VIEW_MODES.WEEKLY:
        return <WeeklyView currentDate={currentDate} />;
      case VIEW_MODES.MONTHLY:
        return (
          <MonthlyView
            currentDate={currentDate}
            onDateSelect={date => {
              setCurrentDate(date);
              setViewMode(VIEW_MODES.DAILY);
            }}
          />
        );
      case VIEW_MODES.YEARLY:
        return (
          <YearlyView
            currentDate={currentDate}
            onMonthSelect={date => {
              setCurrentDate(date);
              setViewMode(VIEW_MODES.MONTHLY);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button onClick={handlePrevious} className="control-button">
            <FiChevronLeft />
          </button>

          <div className="date-display">
            <h2>{getDateRangeText()}</h2>
            {dateHelpers.isToday(currentDate) && (
              <span className="today-badge">Today</span>
            )}
          </div>

          <button onClick={handleNext} className="control-button">
            <FiChevronRight />
          </button>
        </div>

        <div className="view-switcher">
          {!dateHelpers.isToday(currentDate) && (
            <button onClick={handleToday} className="today-button">
              Today
            </button>
          )}
          <button
            className={
              viewMode === VIEW_MODES.DAILY
                ? 'view-button active'
                : 'view-button'
            }
            onClick={() => setViewMode(VIEW_MODES.DAILY)}
          >
            Day
          </button>
          <button
            className={
              viewMode === VIEW_MODES.WEEKLY
                ? 'view-button active'
                : 'view-button'
            }
            onClick={() => setViewMode(VIEW_MODES.WEEKLY)}
          >
            Week
          </button>
          <button
            className={
              viewMode === VIEW_MODES.MONTHLY
                ? 'view-button active'
                : 'view-button'
            }
            onClick={() => setViewMode(VIEW_MODES.MONTHLY)}
          >
            Month
          </button>
          <button
            className={
              viewMode === VIEW_MODES.YEARLY
                ? 'view-button active'
                : 'view-button'
            }
            onClick={() => setViewMode(VIEW_MODES.YEARLY)}
          >
            Year
          </button>
        </div>
      </div>

      <div className="calendar-content">{renderView()}</div>
    </div>
  );
};

export default CalendarView;
