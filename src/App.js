import React, { useState, useEffect } from 'react';
import './App.css';
import ChatInstance from './components/ChatInstance';
import ApiKeyModal from './components/ApiKeyModal';
import Sidebar from './components/Sidebar';
import UserAuth from './components/UserAuth';
import SplashPage from './components/SplashPage'; // Import the SplashPage component
import axios from 'axios'; // Import the ApiKeyModal component
import { v4 as uuidv4 } from 'uuid';
 // Import the Auth component




function App() {
  // const initialChatInstanceId = uuidv4();
  // const [chatInstances, setChatInstances] = useState([
  //   { id: initialChatInstanceId, number: 1 },
  // ]);
  const [chatInstances, setChatInstances] = useState([]);

  const [activeChat, setActiveChat] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(true);
  const [hasChatInstances, setHasChatInstances] = useState(true);
  const [isSplashVisible, setIsSplashVisible] = useState(false);
  const [cognitoUserId, setCognitoUserId] = useState(null);

  
  useEffect(() => {
    const idToken = localStorage.getItem("idToken");
    const accessToken = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("cognitoUserId");
  
    if (idToken && accessToken && userId) {
      setIsLoggedIn(true);
      setCognitoUserId(userId);
      console.log("cognitoUserId updated in useEffect:", userId); // Add this line
    }
  }, []);
  
  

  
  // useEffect(() => {
  //   setHasChatInstances(chatInstances.length > 0);
  // }, [chatInstances]);
  useEffect(() => {
    setHasChatInstances(chatInstances.length > 0);
    setIsSplashVisible(chatInstances.length === 0);
  }, [chatInstances]);
  
  useEffect(() => {
    if (apiKey) {
      createNewChatInstance();
    }
  }, [apiKey]);
  
  // const [isSplashPageVisible, setIsSplashPageVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogin = (idToken, accessToken, userId) => {
    // Save the tokens and user ID to local storage
    localStorage.setItem("idToken", idToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("cognitoUserId", userId);
  
    // Set the isLoggedIn and cognitoUserId states
    setIsLoggedIn(true);
    setCognitoUserId(userId);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
  };
  
  

  const handleSaveApiKey = (key) => {
    console.log("cognitoUserId in handleSaveApiKey:", cognitoUserId); // Add this line
    console.log("API key received in handleSaveApiKey:", key);
    sendApiKeyToBackend(key, cognitoUserId);
    setApiKey(key);
  };
  
  const sendApiKeyToBackend = async ( key  ) => {
    console.log('Sending API key:', key);
    console.log('Sending userid:',cognitoUserId)
    try {

      await axios.post('https://45vnr27amf.execute-api.us-east-1.amazonaws.com/prodstoreapikey', { cognito_user_id: cognitoUserId, user_api_key: key});
    } catch (error) {
      console.error('Error sending API key:', error);
    }
  };
  // ... rest of the code


  // const createNewChatInstance = () => {
  //   const newId = uuidv4();
  //   const newNumber = chatInstances.length + 1;
  //   setChatInstances((prevInstances) => [
  //     ...prevInstances,
  //     { id: newId, number: newNumber },
  //   ]);
  //   setActiveChat(newId);
  //   sendUUIDToBackend(newId);
  // };
  const createNewChatInstance = () => {
    console.log("API key in createNewChatInstance:", apiKey);
    const newId = uuidv4();
    const newNumber = chatInstances.length + 1;
    setChatInstances((prevInstances) => [
      ...prevInstances,
      { id: newId, number: newNumber },
    ]);
    setActiveChat(newId);
    sendUUIDToBackend(newId, apiKey);
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

  // const sendApiKeyToBackend = async (key) => {
  //   try {
  //     await axios.post('http://localhost:5001/save_api_key', { apiKey: key });
  //   } catch (error) {
  //     console.error('Error sending API key:', error);
  //   }
  // }; 

  const sendUUIDToBackend = async (uuid, key) => {
    console.log('Sending API key:', key);
    try {
      await axios.post('http://localhost:5001/save_uuid', { uuid: uuid, apiKey: key });
    } catch (error) {
      console.error('Error sending API key:', error);
    }
  }; 

  // const handleContinueFromSplash = () => {
  //   setIsSplashPageVisible(false);
  // };

  // if (isSplashPageVisible) {
  //   return (
  //     <div className="App">
  //       <SplashPage onContinue={handleContinueFromSplash} />
  //     </div>
  //   );
  // }
  if (!isLoggedIn) {
    return (
      <div className="App">
        <UserAuth onLogin={handleLogin} />
      </div>
    );
  }
  return (
    <div className="App">
      <button onClick={toggleSidebarVisibility} className='toggle-sidebar-btn'></button>
      <div className='Sidebar-Container' style={{ display: isSidebarVisible ? 'block' : 'none' }}>
        <Sidebar
          chatInstances={chatInstances}
          activeChat={activeChat}
          setActiveChatInstance={setActiveChatInstance}
          createNewChatInstance={createNewChatInstance}
          deleteChatInstance={deleteChatInstance}
        />
        <div className='Sidebar-Container2'>
        <button onClick={() => setIsApiKeyModalOpen(true)} className='add-api-key-btn'>Add API Key</button>
        <a href="https://discord.gg/jArkwmxAFW" target="_blank" rel="noreferrer">
          <button className='join-discord-btn'>Join Discord</button>
        </a>
                  {/* contact us button that is a link to email */}
        <a href="mailto:contact@gptcolab.com" target="_blank" rel="noreferrer">
          <button className='contact-us-btn'>Contact Us</button>
        </a>
        <button onClick={handleLogout} className='logout-btn'>Logout</button>
        </div>
      </div>
      
      {/* <div className="ChatInstance-Container">
        
        {chatInstances.map((instance) => (
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
        ))}
      </div> */}
      <div className="ChatInstance-Container">
  {isSplashVisible ? (
    <SplashPage />
  ) : (
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
