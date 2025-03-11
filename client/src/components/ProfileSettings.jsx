import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/config';
import './ProfileSettings.css';

function ProfileSettings() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    gradeLevel: user?.gradeLevel || '',
    selectedSubjects: user?.selectedSubjects || []
  });

  const [settings, setSettings] = useState({
    studyReminders: {
      enabled: true,
      frequency: 'daily',
      customSchedule: []
    },
    quizReminders: {
      enabled: true,
      frequency: 'weekly'
    },
    progressUpdates: {
      enabled: true,
      frequency: 'weekly'
    },
    emailNotifications: {
      studyReminders: true,
      quizAvailable: true,
      progressReports: true,
      inactivityAlerts: true
    }
  });

  useEffect(() => {
    if (user?.notificationPreferences) {
      setSettings(user.notificationPreferences);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => {
      const subjects = prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject];
      
      return {
        ...prev,
        selectedSubjects: subjects
      };
    });
  };

  const handleToggle = (category, field) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }));
  };

  const handleFrequencyChange = (category, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        frequency: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/api/user/profile', formData);
      setSuccess('Profile updated successfully!');
      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/api/user/notification-settings', settings);
      setSuccess('Notification settings updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings">
      <h2>Profile Settings</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            minLength={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled
          />
          <small>Email cannot be changed</small>
        </div>

        <div className="form-group">
          <label htmlFor="gradeLevel">Grade Level</label>
          <select
            id="gradeLevel"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Grade Level</option>
            {['Grade-1', 'Grade-2', 'Grade-3', 'Grade-4', 'Grade-5', 'Grade-6', 'Grade-7', 'Grade-8', 'O-Level'].map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Subjects</label>
          <div className="subjects-grid">
            {['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Pakistan-Studies'].map(subject => (
              <div key={subject} className="subject-item">
                <input
                  type="checkbox"
                  id={subject}
                  checked={formData.selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectToggle(subject)}
                />
                <label htmlFor={subject}>{subject}</label>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="save-button" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <h2>Notification Settings</h2>
      
      <form onSubmit={handleSettingsSubmit}>
        <section className="settings-section">
          <h3>Study Reminders</h3>
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.studyReminders.enabled}
                onChange={() => handleToggle('studyReminders', 'enabled')}
              />
              Enable Study Reminders
            </label>
            
            {settings.studyReminders.enabled && (
              <div className="frequency-select">
                <label>Reminder Frequency:</label>
                <select
                  value={settings.studyReminders.frequency}
                  onChange={(e) => handleFrequencyChange('studyReminders', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom Schedule</option>
                </select>
              </div>
            )}
          </div>
        </section>

        <section className="settings-section">
          <h3>Quiz Reminders</h3>
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.quizReminders.enabled}
                onChange={() => handleToggle('quizReminders', 'enabled')}
              />
              Enable Quiz Reminders
            </label>
            
            {settings.quizReminders.enabled && (
              <div className="frequency-select">
                <label>Reminder Frequency:</label>
                <select
                  value={settings.quizReminders.frequency}
                  onChange={(e) => handleFrequencyChange('quizReminders', e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            )}
          </div>
        </section>

        <section className="settings-section">
          <h3>Progress Updates</h3>
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.progressUpdates.enabled}
                onChange={() => handleToggle('progressUpdates', 'enabled')}
              />
              Enable Progress Updates
            </label>
            
            {settings.progressUpdates.enabled && (
              <div className="frequency-select">
                <label>Update Frequency:</label>
                <select
                  value={settings.progressUpdates.frequency}
                  onChange={(e) => handleFrequencyChange('progressUpdates', e.target.value)}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>
        </section>

        <section className="settings-section">
          <h3>Email Notifications</h3>
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications.studyReminders}
                onChange={() => handleToggle('emailNotifications', 'studyReminders')}
              />
              Study Reminder Emails
            </label>
          </div>
          
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications.quizAvailable}
                onChange={() => handleToggle('emailNotifications', 'quizAvailable')}
              />
              New Quiz Notifications
            </label>
          </div>
          
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications.progressReports}
                onChange={() => handleToggle('emailNotifications', 'progressReports')}
              />
              Progress Report Emails
            </label>
          </div>
          
          <div className="setting-item">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.emailNotifications.inactivityAlerts}
                onChange={() => handleToggle('emailNotifications', 'inactivityAlerts')}
              />
              Inactivity Alerts
            </label>
          </div>
        </section>

        <button 
          type="submit" 
          className="save-button" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

export default ProfileSettings;
