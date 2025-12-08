import { useState, useEffect } from 'react';
import { FiZap } from 'react-icons/fi';
import { useShifts } from '../../hooks/useShifts';
import { dateHelpers } from '../../utils/dateHelpers';
import { settingsService } from '../../services/settingsService';
import { employeeService } from '../../services/employeeService';
import { shiftService } from '../../services/shiftService';
import { generateWeeklySchedule } from '../../utils/autoScheduler';
import ShiftCard from '../shifts/ShiftCard';
import Modal from '../common/Modal';
import './WeeklyView.scss';

const WeeklyView = ({ currentDate }) => {
  const { start, end } = dateHelpers.getWeekRange(currentDate);
  const startStr = dateHelpers.formatDateForDB(start);
  const endStr = dateHelpers.formatDateForDB(end);
  const { shifts, loading, deleteShift } = useShifts(startStr, endStr);
  const [settings, setSettings] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    showCancel: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const result = await settingsService.getSettings();
      if (result.success) {
        setSettings(result.data);
      }
    };
    loadSettings();
  }, []);

  const daysInWeek = dateHelpers.getDaysInWeek(currentDate);

  const getShiftsForDay = date => {
    const dateStr = dateHelpers.formatDateForDB(date);
    return shifts.filter(shift => shift.date === dateStr);
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
      showCancel: false,
    });
  };

  const showModalMessage = (
    type,
    title,
    message,
    onConfirm = null,
    showCancel = false
  ) => {
    setModal({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      onCancel: closeModal,
      showCancel,
    });
  };

  const handleGenerateSchedule = async () => {
    if (!settings) {
      showModalMessage(
        'error',
        'Error',
        'Settings not loaded. Please try again.'
      );
      return;
    }

    const message =
      shifts.length > 0
        ? 'This will replace all existing shifts for this week. Are you sure you want to continue?'
        : 'This will generate shifts for the entire week based on employee availability. Continue?';

    showModalMessage(
      'confirm',
      'Generate Weekly Schedule',
      message,
      () => {
        closeModal();
        generateScheduleConfirmed();
      },
      true
    );
  };

  const generateScheduleConfirmed = async () => {
    setGenerating(true);

    try {
      // Delete existing shifts for this week first
      if (shifts.length > 0) {
        await Promise.all(
          shifts.map(shift => shiftService.deleteShift(shift.id))
        );
      }

      const empResult = await employeeService.getEmployees();
      if (!empResult.success) {
        throw new Error('Failed to fetch employees');
      }

      const generatedShifts = generateWeeklySchedule(
        start,
        empResult.data,
        settings
      );

      if (generatedShifts.length === 0) {
        showModalMessage(
          'warning',
          'No Shifts Generated',
          'No shifts could be generated. Check employee availability and requirements.'
        );
        setGenerating(false);
        return;
      }

      const result = await shiftService.batchAddShifts(generatedShifts);

      if (result.success) {
        showModalMessage(
          'success',
          'Success',
          `Successfully generated ${result.count} shifts for the week!`
        );
      } else {
        showModalMessage('error', 'Error', 'Failed to save generated shifts.');
      }
    } catch (error) {
      showModalMessage(
        'error',
        'Error',
        'An error occurred while generating the schedule.'
      );
    } finally {
      setGenerating(false);
    }
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
      <div className="weekly-view-header">
        <h3>
          Week of {dateHelpers.formatDate(start, 'MMM dd')} -{' '}
          {dateHelpers.formatDate(end, 'MMM dd, yyyy')}
        </h3>
        <button
          onClick={handleGenerateSchedule}
          className="generate-button"
          disabled={generating}
        >
          <FiZap /> {generating ? 'Generating...' : 'Generate Weekly Schedule'}
        </button>
      </div>
      <div className="week-grid">
        {daysInWeek.map(day => {
          const dayShifts = getShiftsForDay(day);
          const isToday = dateHelpers.isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`day-column ${isToday ? 'today' : ''}`}
            >
              <div className="day-header">
                <div className="day-name">
                  {dateHelpers.getDayName(day, true)}
                </div>
                <div className="day-date">
                  {dateHelpers.formatDate(day, 'dd')}
                </div>
                {isToday && <div className="today-label">Today</div>}
              </div>

              <div className="day-shifts">
                {dayShifts.length === 0 ? (
                  <div className="no-shifts">No shifts</div>
                ) : (
                  dayShifts.map(shift => (
                    <ShiftCard key={shift.id} shift={shift} compact />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        showCancel={modal.showCancel}
        confirmText={modal.type === 'confirm' ? 'Continue' : 'OK'}
        cancelText="Cancel"
      />
    </div>
  );
};

export default WeeklyView;
