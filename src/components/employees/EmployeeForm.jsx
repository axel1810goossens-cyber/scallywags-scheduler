import { useState, useEffect, useRef } from 'react';
import { FiX, FiSave, FiAlertCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useEmployees } from '../../hooks/useEmployees';
import { validators } from '../../utils/validators';
import './EmployeeForm.scss';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const EmployeeForm = ({ employee, onClose }) => {
  const initializedRef = useRef(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Server',
    availability: {},
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addEmployee, updateEmployee } = useEmployees();

  useEffect(() => {
    // Only initialize once to prevent resetting form when employee object reference changes due to polling
    if (initializedRef.current) return;

    console.log('useEffect running - initializing form, employee:', employee);

    if (employee) {
      console.log('Setting form data from employee:', employee);
      initializedRef.current = true;

      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        availability: employee.availability || {},
      });
    } else {
      // Initialize empty availability for new employee
      const initialAvailability = {};
      DAYS_OF_WEEK.forEach(day => {
        initialAvailability[day.id] = [];
      });
      console.log('Initializing empty form');

      setFormData({
        name: '',
        email: '',
        phone: '',
        position: 'server',
        availability: initialAvailability,
      });
    }
    initializedRef.current = true;
  }, [employee]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleAvailabilityChange = (dayId, index, field, value) => {
    setFormData(prev => {
      const newAvailability = { ...prev.availability };
      const daySlots = [...(newAvailability[dayId] || [])];

      daySlots[index] = { ...daySlots[index], [field]: value };
      newAvailability[dayId] = daySlots;

      return { ...prev, availability: newAvailability };
    });
  };

  const addTimeSlot = (dayId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('addTimeSlot called for:', dayId);
    console.log('Current formData.availability:', formData.availability);

    setFormData(prev => {
      console.log('Previous state:', prev);
      const newAvailability = { ...prev.availability };
      const daySlots = [...(newAvailability[dayId] || [])];

      daySlots.push({ start: '09:00', end: '17:00' });
      newAvailability[dayId] = daySlots;

      console.log('New availability:', newAvailability);
      console.log('New state:', { ...prev, availability: newAvailability });

      return { ...prev, availability: newAvailability };
    });
  };

  const removeTimeSlot = (dayId, index) => {
    setFormData(prev => {
      const newAvailability = { ...prev.availability };
      const daySlots = [...(newAvailability[dayId] || [])];

      daySlots.splice(index, 1);
      newAvailability[dayId] = daySlots;

      return { ...prev, availability: newAvailability };
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Validation
    if (!validators.isRequired(formData.name)) {
      setError('Name is required');
      return;
    }

    if (!validators.isValidEmail(formData.email)) {
      setError('Invalid email address');
      return;
    }

    if (!validators.isValidPhone(formData.phone)) {
      setError('Invalid phone number');
      return;
    }

    setIsSubmitting(true);

    let result;
    if (employee) {
      result = await updateEmployee(employee.id, formData);
    } else {
      result = await addEmployee(formData);
    }

    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to save employee');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content employee-modal">
        <div className="modal-header">
          <h2>{employee ? 'Edit Employee' : 'New Employee'}</h2>
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

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section availability-section">
            <h3>Weekly Availability</h3>
            <div className="availability-grid">
              {DAYS_OF_WEEK.map(day => (
                <div key={day.id} className="day-availability">
                  <div className="day-header">
                    <span className="day-label">{day.label}</span>
                    <button
                      type="button"
                      onClick={e => addTimeSlot(day.id, e)}
                      className="add-slot-btn"
                      title="Add time slot"
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="time-slots">
                    {formData.availability[day.id]?.length === 0 ? (
                      <span className="no-availability">Unavailable</span>
                    ) : (
                      formData.availability[day.id]?.map((slot, index) => (
                        <div key={index} className="time-slot-row">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={e =>
                              handleAvailabilityChange(
                                day.id,
                                index,
                                'start',
                                e.target.value
                              )
                            }
                          />
                          <span>to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={e =>
                              handleAvailabilityChange(
                                day.id,
                                index,
                                'end',
                                e.target.value
                              )
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(day.id, index)}
                            className="remove-slot-btn"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? <span className="spinner-sm"></span> : <FiSave />}
              {employee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
