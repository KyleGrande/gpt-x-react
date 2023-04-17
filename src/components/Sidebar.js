// src/Sidebar.js
import React from 'react';
import './style/Sidebar.css';

function Sidebar({
  chatInstances,
  activeChat,
  setActiveChatInstance,
  createNewChatInstance,
  deleteChatInstance,
}) {
  return (
    <div className="sidebar">
      <h2>CoLabs</h2>
      <button className='init-btn' onClick={createNewChatInstance}>Create CoLab</button>
      <div className='instances-container'>
        {chatInstances.map((instance) => (
          <p
            key={instance.id}
            className={activeChat === instance.id ? 'active-chat' : ''}
            onClick={() => setActiveChatInstance(instance.id)}
          >
            <button
              className='delete-instance-btn'
              onClick={() => deleteChatInstance(instance.id)}
            >
              X
            </button>
            CoLab {instance.number}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
