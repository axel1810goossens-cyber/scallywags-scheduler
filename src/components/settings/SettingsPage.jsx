import { useState, useEffect } from 'react';
import { FiSave, FiClock, FiUsers, FiAlertCircle } from 'react-icons/fi';
import { settingsService } from '../../services/settingsService';
import './SettingsPage.scss';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hours'); // 'hours' or 'requirements'
  const [message, setMessage] = useState(null);

  const loadSettings = async () => {
    setLoading(true);
    const result = await settingsService.getSettings();
    if (result.success) {
      setSettings(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await settingsService.updateSettings(settings);
    setSaving(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } else {
      setMessage({ type: 'error', text: 'Failed to save settings.' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleHourChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleRequirementChange = (position, field, value) => {
    setSettings(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [position]: {
          ...prev.requirements[position],
          [field]: parseInt(value) || 0,
        },
      },
    }));
  };

  if (loading)
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
      </div>
    );
  if (!settings)
    return (
      <div className="settings-loading">
        <p>Failed to load settings</p>
      </div>
    );

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <button className="save-button" onClick={handleSave} disabled={saving}>
          {saving ? (
            'Saving...'
          ) : (
            <>
              <FiSave /> Save Changes
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`message-banner ${message.type}`}>
          {message.type === 'error' && <FiAlertCircle />}
          {message.text}
        </div>
      )}

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'hours' ? 'active' : ''}`}
          onClick={() => setActiveTab('hours')}
        >
          <FiClock /> Opening Hours
        </button>
        <button
          className={`tab ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          <FiUsers /> Staffing Requirements
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'hours' && (
          <div className="hours-section">
            <div className="section-info">
              <h3>Restaurant Opening Hours</h3>
              <p>
                Define the operating hours for each day. This helps in
                calculating shift coverage.
              </p>
            </div>

            <div className="hours-grid">
              {settings.openingHours &&
                Object.entries(settings.openingHours).map(([day, hours]) => (
                  <div
                    key={day}
                    className={`day-row ${hours.closed ? 'closed' : ''}`}
                  >
                    <div className="day-name">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </div>

                    <div className="hours-controls">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={hours.closed}
                          onChange={e =>
                            handleHourChange(day, 'closed', e.target.checked)
                          }
                        />
                        Closed
                      </label>

                      {!hours.closed && (
                        <>
                          <div className="time-input">
                            <span>Open</span>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={e =>
                                handleHourChange(day, 'open', e.target.value)
                              }
                            />
                          </div>
                          <div className="time-input">
                            <span>Close</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={e =>
                                handleHourChange(day, 'close', e.target.value)
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              {!settings.openingHours && (
                <p>No opening hours configuration found.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="requirements-section">
            <div className="section-info">
              <h3>Staffing Requirements</h3>
              <p>
                Set the minimum number of staff and total hours needed per
                position daily.
              </p>
            </div>

            <div className="requirements-grid">
              {settings.requirements &&
                Object.entries(settings.requirements).map(([position, req]) => (
                  <div key={position} className="requirement-card">
                    <h4>{position}</h4>

                    <div className="req-input-group">
                      <label>Min. Staff per Shift</label>
                      <input
                        type="number"
                        min="0"
                        value={req.minCount}
                        onChange={e =>
                          handleRequirementChange(
                            position,
                            'minCount',
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="req-input-group">
                      <label>Min. Total Hours (Daily)</label>
                      <input
                        type="number"
                        min="0"
                        value={req.minHours}
                        onChange={e =>
                          handleRequirementChange(
                            position,
                            'minHours',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
