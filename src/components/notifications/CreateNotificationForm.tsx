import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_NOTIFICATION } from '../../graphql/operations';
import './Notifications.css';

const CreateNotificationForm = ({ currentUser, onNotificationCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [createNotification] = useMutation(CREATE_NOTIFICATION, {
    onCompleted: () => {
      setIsLoading(false);
      onNotificationCreated();
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      setErrors({ submit: error.message || 'Failed to create notification' });
      setIsLoading(false);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length > 500) {
      newErrors.message = 'Message must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    createNotification({
      variables: {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        userId: parseInt(currentUser.id)
      }
    });
  };

  const notificationTypes = [
    { value: 'info', label: 'Info ℹ️', color: '#17a2b8' },
    { value: 'success', label: 'Success ✅', color: '#28a745' },
    { value: 'warning', label: 'Warning ⚠️', color: '#ffc107' },
    { value: 'error', label: 'Error ❌', color: '#dc3545' }
  ];

  return (
    <div className="create-notification-form">
      <div className="form-header">
        <h3>Create New Notification</h3>
        <button 
          className="close-form"
          onClick={onCancel}
          aria-label="Close form"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter notification title..."
            className={errors.title ? 'error' : ''}
            disabled={isLoading}
            maxLength={100}
          />
          <div className="input-meta">
            <span className="char-count">{formData.title.length}/100</span>
          </div>
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter notification message..."
            className={errors.message ? 'error' : ''}
            disabled={isLoading}
            rows={4}
            maxLength={500}
          />
          <div className="input-meta">
            <span className="char-count">{formData.message.length}/500</span>
          </div>
          {errors.message && <span className="error-message">{errors.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={isLoading}
          >
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="create-button"
            disabled={isLoading || !formData.title.trim() || !formData.message.trim()}
          >
            {isLoading ? 'Creating...' : 'Create Notification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNotificationForm;