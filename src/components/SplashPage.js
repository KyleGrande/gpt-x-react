// src/components/SplashPage.js
import React from 'react';
import './style/SplashPage.css';

const SplashPage = ({ onContinue }) => {
  return (
    <div className="SplashPage">
      <h1>Are you ready to Colab?</h1>
      {/* image to neu.jpg */}
      <img src={`${process.env.PUBLIC_URL}/2103633.png`} alt="My Image" />
      {/* <h2>Press to <button onClick={onContinue}>Continue</button>.</h2> */}

    </div>
  );
};

export default SplashPage;
