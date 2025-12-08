import { useState } from 'react';
import { FiMail, FiPhone, FiEdit2, FiTrash2, FiClock } from 'react-icons/fi';
import { useEmployees } from '../../hooks/useEmployees';
import EmployeeForm from './EmployeeForm';
import './EmployeeCard.scss';

const EmployeeCard = ({ employee }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { deleteEmployee } = useEmployees();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${employee.name}?`)) {
      await deleteEmployee(employee.id);
    }
  };

  // Calculate total available hours (approximate)
  const getTotalHours = () => {
    if (!employee.availability) return 0;

    let total = 0;
    Object.values(employee.availability).forEach(slots => {
      slots.forEach(slot => {
        const start = parseInt(slot.start.split(':')[0]);
        const end = parseInt(slot.end.split(':')[0]);
        total += end - start;
      });
    });
    return total;
  };

  return (
    <>
      <div className="employee-card">
        <div className="card-header">
          <div className="employee-avatar">{employee.name.charAt(0)}</div>
          <div className="employee-info">
            <h3>{employee.name}</h3>
            <span className="position">{employee.position}</span>
          </div>
          <div className="card-actions">
            <button
              onClick={() => setShowEditForm(true)}
              className="action-btn edit"
            >
              <FiEdit2 />
            </button>
            <button onClick={handleDelete} className="action-btn delete">
              <FiTrash2 />
            </button>
          </div>
        </div>

        <div className="card-details">
          <div className="detail-item">
            <FiMail />
            <span>{employee.email}</span>
          </div>
          <div className="detail-item">
            <FiPhone />
            <span>{employee.phone}</span>
          </div>
          <div className="detail-item">
            <FiClock />
            <span>~{getTotalHours()} hrs/week availability</span>
          </div>
        </div>
      </div>

      {showEditForm && (
        <EmployeeForm
          employee={employee}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </>
  );
};

export default EmployeeCard;
