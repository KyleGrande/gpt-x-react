import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { agate } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);

const ChatInstance = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [codeSnippets, setCodeSnippets] = useState([]);
    const [snippetIndex, setSnippetIndex] = useState(-1);
    const fileInputRef = useRef();
    const chatAreaRef = useRef();
  
    useEffect(() => {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }, [messages]);
    
    //TEST
    const formatMessage = (message) => {
      const linkRegex = /\[link\](.*?)\[\/link\]/g;
      const parts = message.split(linkRegex);
      const matches = Array.from(message.matchAll(linkRegex));
    
      return (
        <>
          {parts.map((part, index) => {
            if (index < matches.length) {
              const filePath = matches[index][1];
              const fileName = filePath.split('/').pop();
              const fileURL = process.env.PUBLIC_URL + filePath;
              return (
                <React.Fragment key={index}>
                  {part}
                  <a href={fileURL} download={fileName} target="_blank" rel="noopener noreferrer">
                    {fileName}
                  </a>
                </React.Fragment>
              );
            }
            return part;
          })}
        </>
      );
    };

    const sendMessage = async (e) => {
      e.preventDefault();
    
      if (userInput.trim() !== '') {
        appendMessage('You', userInput);
        setUserInput('');
    
        try {
          const formData = new FormData();
          formData.append('message', userInput);
    
          const response = await axios.post('http://localhost:5001/send_message', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
    
          const data = response.data;
    
          appendMessage('Assistant', data.response);
    
          if (data.code_snippet || data.interpreter_output) {
            updateInterpreter(data.code_snippet, data.interpreter_output.result);
          }
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    };
    
  
    const appendMessage = (sender, message) => {
      setMessages((prevMessages) => [...prevMessages, { sender, message }]);
    };
  
    const uploadFile = async () => {
      if (fileInputRef.current.files.length === 0) {
        return;
      }
  
      const formData = new FormData();
      formData.append('file', fileInputRef.current.files[0]);
  
      try {
        const response = await axios.post('http://localhost:5001/send_file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        appendMessage('Interpreter', JSON.stringify(response.data.result));
      } catch (error) {
        appendMessage('Interpreter', 'Error: ' + error.response.data);
      }
    };
  
    const updateInterpreter= (code, output) => {
      setCodeSnippets((prevSnippets) => [...prevSnippets, { code, output }]);
      setSnippetIndex((prevIndex) => prevIndex + 1);
    };
  
    const goToPreviousCode = () => {
      if (snippetIndex > 0) {
        setSnippetIndex((prevIndex) => prevIndex - 1);
      }
    };
  
    const goToNextCode = () => {
      if (snippetIndex < codeSnippets.length - 1) {
        setSnippetIndex((prevIndex) => prevIndex + 1);
      }
    };
  
    return (
      <div className="Chat-Instance">
        <div id="chat-container">
          <h1>GPT-X (Alpha)</h1>
          <div id="chat-area" ref={chatAreaRef}>
            {/* {messages.map((msg, index) => (
              <p key={index} className={`${msg.sender.toLowerCase()}-message`}>
                <b>{msg.sender}:</b> {msg.message}
              </p>
            ))} */}
            {messages.map((msg, index) => (
              <p key={index} className={`${msg.sender.toLowerCase()}-message`}>
                <b>{msg.sender}:</b> {formatMessage(msg.message)}
              </p>
            ))}
          </div>
          <form onSubmit={sendMessage} id="chat-form">
            <input
              type="text"
              id="user-input"
              placeholder='if __begin__ == __"convo"__: intialize_instance()'
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <button type="submit">Send</button>
            
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
            >
              Upload
            </button>
            <input
              type="file"
              id="file-input"
              ref={fileInputRef}
              accept=".py,.txt"
              onChange={uploadFile}
              style={{ display: 'none' }}
            />
            {/* The Monitor Uploads functionality is not included, as it relies on features not supported by all browsers */}
          </form>
        </div>
        <div id="interpreter-container">
          <h1 id="python-title">
            Python Interpreter
            <div>
              <button id="previous-code" onClick={goToPreviousCode}>
                Previous Code
              </button>
              <button id="next-code" onClick={goToNextCode}>
                Next Code
              </button>
            </div>
          </h1>
  
          <div id="interpreter-area">
            {snippetIndex >= 0 && (
              <SyntaxHighlighter language="python" style={agate}>
              {codeSnippets[snippetIndex].code}
            </SyntaxHighlighter>
            )}
          </div>
          <h2>Interpreter Output</h2>
          <div id="interpreter-output">
            {snippetIndex >= 0 && (
              <SyntaxHighlighter language="bash" style={agate}>
              {`user@gpt-x:~$\n${codeSnippets[snippetIndex].output}`}
            </SyntaxHighlighter>
  
            )}
          </div>
        </div>
      </div>
    );
  }

export default ChatInstance;