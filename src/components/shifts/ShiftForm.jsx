import { useState, useEffect } from 'react';
import { FiX, FiSave, FiAlertCircle, FiSearch, FiChevronDown } from 'react-icons/fi';
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
        position: '',
        notes: ''
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

    const { employees, loading: employeesLoading } = useEmployees();
    const { addShift, updateShift } = useShifts();

    useEffect(() => {
        if (shift) {
            setFormData({
                employeeId: shift.employeeId,
                date: shift.date,
                startTime: shift.startTime,
                endTime: shift.endTime,
                position: shift.position || '',
                notes: shift.notes || ''
            });
            // Set employee search to selected employee name
            const selectedEmployee = employees.find(emp => emp.id === shift.employeeId);
            if (selectedEmployee) {
                setEmployeeSearch(selectedEmployee.name);
            }
        }
    }, [shift, employees]);

    // Filter employees based on position and search
    const filteredEmployees = employees.filter(emp => {
        const matchesPosition = !formData.position || emp.position === formData.position;
        const matchesSearch = emp.name.toLowerCase().includes(employeeSearch.toLowerCase());
        return matchesPosition && matchesSearch;
    });

    // Get selected employee name for display
    const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            // Clear employee selection when position changes
            ...(name === 'position' && { employeeId: '' })
        }));
        setError('');
        
        // Clear employee search when position changes
        if (name === 'position') {
            setEmployeeSearch('');
        }
    };

    const handleEmployeeSelect = (employee) => {
        setFormData(prev => ({ 
            ...prev, 
            employeeId: employee.id,
            position: employee.position // Auto-set position when employee is selected
        }));
        setEmployeeSearch(employee.name);
        setShowEmployeeDropdown(false);
        setError('');
    };

    const handleEmployeeSearchChange = (e) => {
        setEmployeeSearch(e.target.value);
        setShowEmployeeDropdown(true);
        // Clear selection if search doesn't match selected employee
        if (selectedEmployee && !selectedEmployee.name.toLowerCase().includes(e.target.value.toLowerCase())) {
            setFormData(prev => ({ ...prev, employeeId: '' }));
        }
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
                        <label>Position</label>
                        <select
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                        >
                            <option value="">Select Position</option>
                            <option value="Server">Server</option>
                            <option value="Bartender">Bartender</option>
                            <option value="Host">Host</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Manager">Manager</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Employee</label>
                        <div className="employee-search-container">
                            <div className="search-input-wrapper">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder={formData.position ? `Search ${formData.position}s...` : "Select position first"}
                                    value={employeeSearch}
                                    onChange={handleEmployeeSearchChange}
                                    onFocus={() => setShowEmployeeDropdown(true)}
                                    disabled={employeesLoading || !formData.position}
                                    className="employee-search-input"
                                />
                                <FiChevronDown 
                                    className={`dropdown-icon ${showEmployeeDropdown ? 'rotated' : ''}`}
                                    onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                                />
                            </div>
                            {showEmployeeDropdown && formData.position && (
                                <div className="employee-dropdown">
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map(emp => (
                                            <div
                                                key={emp.id}
                                                className={`employee-option ${formData.employeeId === emp.id ? 'selected' : ''}`}
                                                onClick={() => handleEmployeeSelect(emp)}
                                            >
                                                <span className="employee-name">{emp.name}</span>
                                                <span className="employee-position">{emp.position}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-employees">
                                            {employeeSearch ? 'No employees found' : `No ${formData.position}s available`}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
