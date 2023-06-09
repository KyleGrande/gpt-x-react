import React, { useState } from 'react';
import './style/ApiKeyModal.css';

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
        <h2>Enter Your <a href='https://platform.openai.com/account/api-keys' target='_blank' rel='noopener noreferrer'>OpenAI</a> Key</h2>
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
