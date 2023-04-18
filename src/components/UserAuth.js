import React, { useState } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import './style/UserAuth.css';

const poolData = {
  UserPoolId: 'us-east-1_hPWUtzf64',
  ClientId: '172tk7g05ebcuf90p8kq42o5vd'
};

const userPool = new CognitoUserPool(poolData);

const registerUser = (password, email, preferredUsername) => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      { Name: 'email', Value: email },
      { Name: 'preferred_username', Value: preferredUsername },
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) reject(err);
      else resolve(result.user);
    });
  });
};

const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });

    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: (result) => {
        const idToken = result.getIdToken().getJwtToken();
        const accessToken = result.getAccessToken().getJwtToken();
        resolve({ idToken, accessToken });
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
};

const confirmRegistration = (email, verificationCode) => {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: userPool });

    user.confirmRegistration(verificationCode, true, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

const UserAuth = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="UserAuth">
      <div className='Auth-form'>
      <div className="Auth-tabs">
        <button
          className={`Auth-tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => switchTab('login')}
        >
          Login
        </button>
        <button
          className={`Auth-tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => switchTab('register')}
        >
          Register
        </button>
      </div>
      {activeTab === 'login' ? (
        <LoginForm onLogin={onLogin} />
      ) : (
        <RegistrationForm onLogin={onLogin} />
      )}
      </div>
      <div className='Auth-Screen'>
        <h1>GPTColab © 2023</h1>

      </div>
    </div>
  );
};

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { idToken, accessToken } = await loginUser(email, password);
      onLogin(idToken, accessToken);
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};
          
const RegistrationForm = ({ onLogin }) => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [preferredUsername, setPreferredUsername] = useState('');
const [verificationCode, setVerificationCode] = useState('');
const [showVerification, setShowVerification] = useState(false);
          
const handleSubmit = async (e) => {
  e.preventDefault();
    try {
      await registerUser(password, email, preferredUsername);
      setShowVerification(true);
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  }; 
const handleVerification = async (e) => {
  e.preventDefault();
    try {
      await confirmRegistration(email, verificationCode);
      onLogin();
    } catch (error) {
      console.error('Error during verification:', error);
    }
  };
          
  return showVerification ? (
    <form onSubmit={handleVerification}>
      <div>
        <label>Verification Code</label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
      </div>
        <button type="submit">Verify</button>
    </form>
    ) : (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Preferred Username</label>
        <input
          type="text"
          value={preferredUsername}
          onChange={(e) => setPreferredUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Email</label>
          <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">Register</button>
    </form>
  );
};
          
export default UserAuth;
