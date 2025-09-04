'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ROOM } from '../../graphql/operations';
import './Chat.css';

const CreateRoomModal = ({ onClose, onRoomCreated, currentUser }: any) => {
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [createRoom] = useMutation(CREATE_ROOM, {
    onCompleted: () => {
      setIsLoading(false);
      onRoomCreated();
    },
    onError: (error) => {
      console.error('Error creating room:', error);
      setError(error.message || 'Failed to create room');
      setIsLoading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    createRoom({
      variables: {
        name: roomName.trim(),
        participantIds: [parseInt(currentUser.id)]
      }
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Create New Room</h3>
          <button 
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-room-form">
          <div className="form-group">
            <label htmlFor="roomName">Room Name</label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => {
                setRoomName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter room name..."
              className={error ? 'error' : ''}
              disabled={isLoading}
              autoFocus
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-button"
              disabled={!roomName.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;