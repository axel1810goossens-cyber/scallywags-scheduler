import { useState, useEffect, useMemo } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';
import { useShifts } from '../../hooks/useShifts';
import { dateHelpers } from '../../utils/dateHelpers';
import { settingsService } from '../../services/settingsService';
import { coverageHelpers } from '../../utils/coverageHelpers';
import ShiftForm from '../shifts/ShiftForm';
import './DailyView.scss';

const DailyView = ({ currentDate }) => {
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [settings, setSettings] = useState(null);

  const dateStr = dateHelpers.formatDateForDB(currentDate);
  const { shifts, loading, deleteShift } = useShifts(dateStr, dateStr);

  useEffect(() => {
    const loadSettings = async () => {
      const result = await settingsService.getSettings();
      if (result.success) {
        setSettings(result.data);
      }
    };
    loadSettings();
  }, []);

  const handleAddShift = () => {
    setEditingShift(null);
    setShowShiftForm(true);
  };

  const handleEditShift = shift => {
    setEditingShift(shift);
    setShowShiftForm(true);
  };

  const handleDeleteShift = async shiftId => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
      await deleteShift(shiftId);
    }
  };

  const handleFormClose = () => {
    setShowShiftForm(false);
    setEditingShift(null);
  };

  const coverage = settings
    ? coverageHelpers.validateDailyCoverage(currentDate, shifts, settings)
    : null;

  // Helper to convert time string to minutes
  const timeToMinutes = timeStr => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Sorting function
  const handleSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Sort shifts based on current sort config
  const sortedShifts = useMemo(() => {
    if (!sortConfig.key) return shifts;

    const sorted = [...shifts].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Special handling for time slot sorting
      if (sortConfig.key === 'startTime') {
        const aMinutes = timeToMinutes(a.startTime);
        const bMinutes = timeToMinutes(b.startTime);
        return sortConfig.direction === 'asc'
          ? aMinutes - bMinutes
          : bMinutes - aMinutes;
      }

      // String comparison for name, position, notes
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }, [shifts, sortConfig]);

  // Get sort indicator icon
  const getSortIcon = columnKey => {
    if (sortConfig.key !== columnKey) {
      return null;
    }
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  if (loading) {
    return (
      <div className="daily-view-loading">
        <div className="spinner"></div>
        <p>Loading shifts...</p>
      </div>
    );
  }

  return (
    <div className="daily-view">
      {coverage && coverage.status !== 'closed' && (
        <div className="coverage-banner-wrapper">
          <div className={`coverage-banner ${coverage.status}`}>
            <div className="status-icon">
              {coverage.status === 'optimal' && <FiCheckCircle />}
              {coverage.status === 'warning' && <FiAlertTriangle />}
              {coverage.status === 'critical' && <FiXCircle />}
            </div>
            <div className="status-content">
              <h4>
                {coverage.status === 'optimal'
                  ? 'Staffing Optimal'
                  : coverage.status === 'warning'
                    ? 'Coverage Warning'
                    : 'Understaffed'}
              </h4>
              {coverage.issues.length > 0 && (
                <ul className="issues-list">
                  {coverage.issues.map((issue, idx) => (
                    <li key={idx} className={issue.type}>
                      {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button onClick={handleAddShift} className="add-shift-button">
            <FiPlus /> Add Shift
          </button>
        </div>
      )}

      {shifts.length === 0 ? (
        <div className="empty-state">
          <p>No shifts scheduled for this day</p>
          <button onClick={handleAddShift} className="empty-state-button">
            <FiPlus /> Schedule First Shift
          </button>
        </div>
      ) : (
        <div className="shifts-table-container">
          <table className="shifts-table">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort('employeeName')}
                  className="sortable"
                >
                  Employee Name {getSortIcon('employeeName')}
                </th>
                <th onClick={() => handleSort('position')} className="sortable">
                  Position {getSortIcon('position')}
                </th>
                <th
                  onClick={() => handleSort('startTime')}
                  className="sortable"
                >
                  Time Slot {getSortIcon('startTime')}
                </th>
                <th onClick={() => handleSort('notes')} className="sortable">
                  Notes {getSortIcon('notes')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedShifts.map(shift => (
                <tr key={shift.id}>
                  <td className="employee-name">{shift.employeeName}</td>
                  <td>{shift.position || 'N/A'}</td>
                  <td className="time-slot">
                    {shift.startTime} - {shift.endTime}
                  </td>
                  <td className="notes">{shift.notes || '-'}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleEditShift(shift)}
                      className="action-button edit"
                      title="Edit shift"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      className="action-button delete"
                      title="Delete shift"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showShiftForm && (
        <ShiftForm
          shift={editingShift}
          defaultDate={currentDate}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default DailyView;
