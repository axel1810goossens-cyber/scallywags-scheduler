import { useState } from 'react';
import { FiX, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { useEmployees } from '../../hooks/useEmployees';
import { useShifts } from '../../hooks/useShifts';
import './ShiftSwapModal.scss';

const ShiftSwapModal = ({ shift, onClose }) => {
  const [targetShiftId, setTargetShiftId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get shifts for the same day to find swap candidates
  const {
    shifts: dayShifts,
    loading: shiftsLoading,
    swapShifts,
  } = useShifts(new Date(shift.date), new Date(shift.date));

  const { employees } = useEmployees();

  // Filter out the current shift and find potential swaps
  const availableSwaps = dayShifts.filter(s => s.id !== shift.id);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!targetShiftId) {
      setError('Please select a shift to swap with');
      return;
    }

    setIsSubmitting(true);

    const targetShift = availableSwaps.find(s => s.id === targetShiftId);
    if (!targetShift) {
      setError('Invalid target shift');
      setIsSubmitting(false);
      return;
    }

    // Get employee data for both shifts
    const currentEmployee = employees.find(e => e.id === shift.employeeId);
    const targetEmployee = employees.find(e => e.id === targetShift.employeeId);

    if (!currentEmployee || !targetEmployee) {
      setError('Could not find employee data');
      setIsSubmitting(false);
      return;
    }

    const result = await swapShifts(
      shift.id,
      targetShift.id,
      currentEmployee,
      targetEmployee
    );

    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to swap shifts');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Swap Shift</h2>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>

        <div className="swap-info">
          <div className="swap-source">
            <span className="label">Current Shift</span>
            <div className="shift-preview">
              <span className="name">{shift.employeeName}</span>
              <span className="time">
                {shift.startTime} - {shift.endTime}
              </span>
            </div>
          </div>

          <div className="swap-icon">
            <FiRefreshCw />
          </div>
        </div>

        {error && (
          <div className="form-error">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="swap-form">
          <div className="form-group">
            <label>Swap with:</label>
            {shiftsLoading ? (
              <p>Loading available shifts...</p>
            ) : availableSwaps.length === 0 ? (
              <p className="no-swaps">No other shifts available on this day.</p>
            ) : (
              <div className="swap-options">
                {availableSwaps.map(s => (
                  <label
                    key={s.id}
                    className={`swap-option ${targetShiftId === s.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="targetShift"
                      value={s.id}
                      checked={targetShiftId === s.id}
                      onChange={e => setTargetShiftId(e.target.value)}
                    />
                    <div className="option-content">
                      <span className="name">{s.employeeName}</span>
                      <span className="time">
                        {s.startTime} - {s.endTime}
                      </span>
                      <span className="position">{s.position}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={isSubmitting || !targetShiftId}
            >
              {isSubmitting ? (
                <span className="spinner-sm"></span>
              ) : (
                <FiRefreshCw />
              )}
              Confirm Swap
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShiftSwapModal;
