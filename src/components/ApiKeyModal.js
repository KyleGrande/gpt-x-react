import React, { useState } from 'react';
import './ApiKeyModal.css';

function ApiKeyModal({ isOpen, onClose, onSave }) {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    onSave(apiKey);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="api-key-modal">
      <div className="modal-content">
        <h2>const apiKey = osenv.get('API_KEY');</h2>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyModal;
