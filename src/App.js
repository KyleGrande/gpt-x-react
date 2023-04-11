import React, { useState, useEffect } from 'react';
import './App.css';
import ChatInstance from './components/ChatInstance';
import ApiKeyModal from './components/ApiKeyModal';
import axios from 'axios'; // Import the ApiKeyModal component


function App() {
  const [chatInstances, setChatInstances] = useState([{ id: 1 }]);
  const [activeChat, setActiveChat] = useState(1);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(true);
  const [hasChatInstances, setHasChatInstances] = useState(true);

  useEffect(() => {
    setHasChatInstances(chatInstances.length > 0);
  }, [chatInstances]);

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    sendApiKeyToBackend(key);
  };

  const createNewChatInstance = () => {
    const newId = chatInstances.length + 1;
    setChatInstances((prevInstances) => [...prevInstances, { id: newId }]);
    setActiveChat(newId);
  };

  const setActiveChatInstance = (id) => {
    setActiveChat(id);
  };

  const deleteChatInstance = (id) => {
    setChatInstances((prevInstances) => prevInstances.filter((instance) => instance.id !== id));
    setActiveChat(chatInstances[0].id);
  };

  const toggleSidebarVisibility = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const sendApiKeyToBackend = async (key) => {
    try {
      await axios.post('http://localhost:5001/save_api_key', { apiKey: key });
    } catch (error) {
      console.error('Error sending API key:', error);
    }
  };

  return (
    <div className="App">
      <button onClick={toggleSidebarVisibility} className='toggle-sidebar-btn'>
       
      </button>
      <div className='sidebar-container' style={{ display: isSidebarVisible ? 'block' : 'none' }}>
        <div className="sidebar">
          <h2>Instances</h2>
          <button onClick={createNewChatInstance}>init Instance</button>
          <div className='instances-container'>
            {chatInstances.map((instance) => (
              <p
                key={instance.id}
                className={activeChat === instance.id ? 'active-chat' : ''}
                onClick={() => setActiveChatInstance(instance.id)}
              >
                <button className='delete-instance-btn' onClick={() => deleteChatInstance(instance.id)}>X</button>
                Instance {instance.id}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="chat-container">
        {hasChatInstances ? (
          chatInstances.map((instance) => (
            <div
              key={instance.id}
              style={{ display: activeChat === instance.id ? 'block' : 'none' }}
            >
              <ChatInstance apiKey={apiKey} onDelete={() => deleteChatInstance(instance.id)} />
            </div>
          ))
        ) : (
          <div className="placeholder-screen">
            <h1>GPT-Xpensive.</h1>
            <p>initalize_instance()</p>
          </div>
        )}
      </div>

      {isApiKeyModalOpen && (
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSave={handleSaveApiKey}
        />
      )}
    </div>
  );
}


export default App;
