import { useState } from 'react';
import { FiClock, FiUser, FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { useShifts } from '../../hooks/useShifts';
import ShiftForm from './ShiftForm';
import ShiftSwapModal from './ShiftSwapModal';
import './ShiftCard.scss';

const ShiftCard = ({ shift, compact = false }) => {
    const [showEditForm, setShowEditForm] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    const { deleteShift } = useShifts();

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this shift?')) {
            await deleteShift(shift.id);
        }
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setShowEditForm(true);
    };

    const handleSwap = (e) => {
        e.stopPropagation();
        setShowSwapModal(true);
    };

    return (
        <>
            <div className={`shift-card ${compact ? 'compact' : ''}`}>
                <div className="shift-header">
                    <div className="employee-info">
                        <FiUser className="icon" />
                        <span className="name">{shift.employeeName}</span>
                    </div>
                    {compact && (
                        <div className="shift-actions-mini">
                            <button onClick={handleEdit} title="Edit">
                                <FiEdit2 />
                            </button>
                        </div>
                    )}
                </div>

                {compact && shift.position && (
                    <div className="shift-position">
                        <span className="position-badge">{shift.position}</span>
                    </div>
                )}

                <div className="shift-time">
                    <FiClock className="icon" />
                    <span>{shift.startTime} - {shift.endTime}</span>
                </div>

                {!compact && (
                    <>
                        <div className="shift-details">
                            <span className="position">{shift.position}</span>
                            {shift.notes && <p className="notes">{shift.notes}</p>}
                        </div>

                        <div className="shift-actions">
                            <button onClick={handleEdit} className="action-btn edit" title="Edit Shift">
                                <FiEdit2 />
                            </button>
                            <button onClick={handleSwap} className="action-btn swap" title="Swap Shift">
                                <FiRefreshCw />
                            </button>
                            <button onClick={handleDelete} className="action-btn delete" title="Delete Shift">
                                <FiTrash2 />
                            </button>
                        </div>
                    </>
                )}
            </div>

            {showEditForm && (
                <ShiftForm
                    shift={shift}
                    defaultDate={new Date(shift.date)}
                    onClose={() => setShowEditForm(false)}
                />
            )}

            {showSwapModal && (
                <ShiftSwapModal
                    shift={shift}
                    onClose={() => setShowSwapModal(false)}
                />
            )}
        </>
    );
};

export default ShiftCard;
