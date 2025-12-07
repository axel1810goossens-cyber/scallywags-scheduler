import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, FiCheckCircle, FiXCircle, FiZap } from 'react-icons/fi';
import { useShifts } from '../../hooks/useShifts';
import { dateHelpers } from '../../utils/dateHelpers';
import { settingsService } from '../../services/settingsService';
import { employeeService } from '../../services/employeeService';
import { shiftService } from '../../services/shiftService';
import { coverageHelpers } from '../../utils/coverageHelpers';
import { generateDailySchedule } from '../../utils/autoScheduler';
import ShiftForm from '../shifts/ShiftForm';
import './DailyView.scss';

const DailyView = ({ currentDate }) => {
    const [showShiftForm, setShowShiftForm] = useState(false);
    const [editingShift, setEditingShift] = useState(null);
    const [settings, setSettings] = useState(null);
    const [generating, setGenerating] = useState(false);

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

    const handleEditShift = (shift) => {
        setEditingShift(shift);
        setShowShiftForm(true);
    };

    const handleDeleteShift = async (shiftId) => {
        if (window.confirm('Are you sure you want to delete this shift?')) {
            await deleteShift(shiftId);
        }
    };

    const handleFormClose = () => {
        setShowShiftForm(false);
        setEditingShift(null);
    };

    const handleGenerateSchedule = async () => {
        if (!settings) {
            alert('Settings not loaded. Please try again.');
            return;
        }

        const confirmed = window.confirm(
            'This will generate shifts for today based on employee availability. Continue?'
        );

        if (!confirmed) return;

        setGenerating(true);

        try {
            const empResult = await employeeService.getEmployees();
            if (!empResult.success) {
                throw new Error('Failed to fetch employees');
            }

            const generatedShifts = generateDailySchedule(currentDate, empResult.data, settings);

            if (generatedShifts.length === 0) {
                alert('No shifts could be generated. Check employee availability and requirements.');
                setGenerating(false);
                return;
            }

            const result = await shiftService.batchAddShifts(generatedShifts);

            if (result.success) {
                alert(`Successfully generated ${result.count} shifts!`);
            } else {
                alert('Failed to save generated shifts.');
            }
        } catch (error) {
            console.error('Error generating schedule:', error);
            alert('An error occurred while generating the schedule.');
        } finally {
            setGenerating(false);
        }
    };

    const coverage = settings ? coverageHelpers.validateDailyCoverage(currentDate, shifts, settings) : null;

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
            <div className="daily-view-header">
                <h3>
                    Shifts for {dateHelpers.formatDate(currentDate, 'EEEE, MMMM dd, yyyy')}
                    {dateHelpers.isToday(currentDate) && <span className="today-badge">Today</span>}
                </h3>
                <div className="header-actions">
                    <button
                        onClick={handleGenerateSchedule}
                        className="generate-button"
                        disabled={generating}
                    >
                        <FiZap /> {generating ? 'Generating...' : 'Generate Schedule'}
                    </button>
                    <button onClick={handleAddShift} className="add-shift-button">
                        <FiPlus /> Add Shift
                    </button>
                </div>
            </div>

            {coverage && coverage.status !== 'closed' && (
                <div className={`coverage-banner ${coverage.status}`}>
                    <div className="status-icon">
                        {coverage.status === 'optimal' && <FiCheckCircle />}
                        {coverage.status === 'warning' && <FiAlertTriangle />}
                        {coverage.status === 'critical' && <FiXCircle />}
                    </div>
                    <div className="status-content">
                        <h4>
                            {coverage.status === 'optimal' ? 'Staffing Optimal' :
                                coverage.status === 'warning' ? 'Coverage Warning' : 'Understaffed'}
                        </h4>
                        {coverage.issues.length > 0 && (
                            <ul className="issues-list">
                                {coverage.issues.map((issue, idx) => (
                                    <li key={idx} className={issue.type}>{issue.message}</li>
                                ))}
                            </ul>
                        )}
                    </div>
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
                                <th>Employee Name</th>
                                <th>Position</th>
                                <th>Time Slot</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.map((shift) => (
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
