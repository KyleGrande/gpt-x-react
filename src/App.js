import React, { useState, useEffect } from 'react';
import './App.css';
import ChatInstance from './components/ChatInstance';
import ApiKeyModal from './components/ApiKeyModal';
import axios from 'axios'; // Import the ApiKeyModal component
import { v4 as uuidv4 } from 'uuid';



function App() {
  const initialChatInstanceId = uuidv4();
  const [chatInstances, setChatInstances] = useState([
    { id: initialChatInstanceId, number: 1 },
  ]);
  const [activeChat, setActiveChat] = useState(initialChatInstanceId);
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
    sendUUIDToBackend(initialChatInstanceId); // Send the initial UUID after the API key is saved
  };

  // ... rest of the code


  const createNewChatInstance = () => {
    const newId = uuidv4();
    const newNumber = chatInstances.length + 1;
    setChatInstances((prevInstances) => [
      ...prevInstances,
      { id: newId, number: newNumber },
    ]);
    setActiveChat(newId);
    sendUUIDToBackend(newId);
  };
  

  const setActiveChatInstance = (id) => {
    setActiveChat(id);
  };

  const deleteChatInstance = (id) => {
    setChatInstances((prevInstances) => {
      const updatedInstances = prevInstances.filter((instance) => instance.id !== id);

      axios.post('http://localhost:5001/delete_chat', { uuid: id })
      .then(() => {
        // You can handle the successful response here if needed
      })
      .catch((error) => {
        console.error('Error deleting chat:', error);
      });
  
      if (id === activeChat && updatedInstances.length > 0) {
        // Set active chat to the most next instance if avaailable if not then previous
        setActiveChat(updatedInstances[updatedInstances.length - 1].id);
      } else if (id !== activeChat) {
        // Set active chat to the same instance
        setActiveChat(activeChat);
      }
      else{
        setActiveChat(null);
      }
  
      return updatedInstances;
    });
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

  const sendUUIDToBackend = async (uuid) => {
    try {
      await axios.post('http://localhost:5001/save_uuid', { uuid: uuid });
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
              <button
                className='delete-instance-btn'
                onClick={() => deleteChatInstance(instance.id)}
              >
                X
              </button>
              Instance {instance.number}
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
                <ChatInstance
                  uuid={instance.id}
                  apiKey={apiKey}
                  onDelete={() => deleteChatInstance(instance.id)}
                />
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
