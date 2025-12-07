import { useState, useEffect } from 'react';
import { FiX, FiSave, FiAlertCircle } from 'react-icons/fi';
import { useEmployees } from '../../hooks/useEmployees';
import { useShifts } from '../../hooks/useShifts';
import { dateHelpers } from '../../utils/dateHelpers';
import { validators } from '../../utils/validators';
import './ShiftForm.scss';

const ShiftForm = ({ shift, defaultDate, onClose }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        date: defaultDate ? dateHelpers.formatDateForDB(defaultDate) : '',
        startTime: '09:00',
        endTime: '17:00',
        position: 'Server',
        notes: ''
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { employees, loading: employeesLoading } = useEmployees();
    const { addShift, updateShift } = useShifts();

    useEffect(() => {
        if (shift) {
            setFormData({
                employeeId: shift.employeeId,
                date: shift.date,
                startTime: shift.startTime,
                endTime: shift.endTime,
                position: shift.position || 'Server',
                notes: shift.notes || ''
            });
        }
    }, [shift]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.employeeId) {
            setError('Please select an employee');
            return;
        }

        if (!validators.isValidTimeRange(formData.startTime, formData.endTime)) {
            setError('End time must be after start time');
            return;
        }

        // Find selected employee
        const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
        if (!selectedEmployee) {
            setError('Invalid employee selected');
            return;
        }

        // Check availability (optional - can be a warning instead of blocking)
        const dayOfWeek = dateHelpers.getDayName(dateHelpers.parseDate(formData.date)).toLowerCase();
        const conflict = validators.checkAvailabilityConflict(
            selectedEmployee,
            dayOfWeek,
            formData.startTime,
            formData.endTime
        );

        if (conflict.hasConflict) {
            if (!window.confirm(`Warning: ${conflict.message}. Do you want to proceed?`)) {
                return;
            }
        }

        setIsSubmitting(true);

        const shiftData = {
            ...formData,
            employeeName: selectedEmployee.name
        };

        let result;
        if (shift) {
            result = await updateShift(shift.id, shiftData);
        } else {
            result = await addShift(shiftData);
        }

        setIsSubmitting(false);

        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'Failed to save shift');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{shift ? 'Edit Shift' : 'New Shift'}</h2>
                    <button onClick={onClose} className="close-button">
                        <FiX />
                    </button>
                </div>

                {error && (
                    <div className="form-error">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="shift-form">
                    <div className="form-group">
                        <label>Employee</label>
                        <select
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            disabled={employeesLoading}
                            required
                        >
                            <option value="">Select Employee</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Time</label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>End Time</label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Position</label>
                        <select
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                        >
                            <option value="Server">Server</option>
                            <option value="Bartender">Bartender</option>
                            <option value="Host">Host</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Manager">Manager</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Optional notes..."
                            rows="3"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-button"
                            disabled={isSubmitting || employeesLoading}
                        >
                            {isSubmitting ? <span className="spinner-sm"></span> : <FiSave />}
                            {shift ? 'Update Shift' : 'Create Shift'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShiftForm;
