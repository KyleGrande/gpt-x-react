import React, { useState, useRef, useEffect } from 'react';
import './style/ChatInstance.css';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { agate } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);


const ChatInstance = ({ uuid, apiKey, onDelete }) => {
  const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [codeSnippets, setCodeSnippets] = useState([]);
    const [snippetIndex, setSnippetIndex] = useState(-1);
    const fileInputRef = useRef();
    const chatAreaRef = useRef();

    useEffect(() => {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }, [messages]);
    
    // //TEST
    // const formatMessage = (message) => {
    //   const linkRegex = /\[link\](.*?)\[\/link\]/g;
    //   const parts = message.split(linkRegex);
    //   const matches = Array.from(message.matchAll(linkRegex));
    
    //   return (
    //     <>
    //       {parts.map((part, index) => {
    //         if (index < matches.length) {
    //           const filePath = matches[index][1];
    //           const fileName = filePath.split('/').pop();
    //           const fileURL = process.env.PUBLIC_URL + filePath;
    //           return (
    //             <React.Fragment key={index}>
    //               {part}
    //               <a href={fileURL} download={fileName} target="_blank" rel="noopener noreferrer">
    //                 {fileName}
    //               </a>
    //             </React.Fragment>
    //           );
    //         }
    //         return part;
    //       })}
    //     </>
    //   );
    // };
    const formatMessage = (message) => {
      const linkRegex = /\[link\]((?:.|\n)*?)\[\/link\]|\[img\]((?:.|\n)*?)\[\/img\]|```((?:.|\n)*?)```|\[web\]((?:.|\n)*?)\[\/web\]/g;

      const parts = message.split(linkRegex);
      const matches = Array.from(message.matchAll(linkRegex));
    
      return (
        <>
          {parts.map((part, index) => {
            if (index < matches.length) {
              const linkMatch = matches[index][1];
              const imgMatch = matches[index][2];
              const codeMatch = matches[index][3];
              const webMatch = matches[index][4];
    
              if (linkMatch) {
                const filePath = linkMatch;
                const fileName = filePath.split('/').pop(); //Fix this eventually
                const fileURL = process.env.PUBLIC_URL + filePath;
                //get the index of the linkmatch in the original parts array
                const linkIndex = parts.indexOf(linkMatch);
                //delete the link match from the parts array
                parts.splice(linkIndex, 1);
                return (
                  <React.Fragment key={index}>
                    {part}
                    <a href={fileURL} download={fileName} target="_blank" rel="noopener noreferrer">
                      {fileName}
                    </a>
                  </React.Fragment>
                );
              } else if (imgMatch) {
                const imgSrc = imgMatch;
                //get the index of the imagematch in the original parts array
                const imgIndex = parts.indexOf(imgMatch);
                //delete the image match from the parts array
                parts.splice(imgIndex, 1);
                return (
                  <React.Fragment key={index}>
                    {part}
                    <img src={imgSrc} alt="" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                  </React.Fragment>
                );
              } else if (codeMatch) {
                const codeSnippet = codeMatch;
                //get the index of the codematch in the original parts array
                const codeIndex = parts.indexOf(codeMatch);
                //delete the codematch match from the parts array
                parts.splice(codeIndex, 1);
                return (
                  <React.Fragment key={index}>
                    {part}
                    <SyntaxHighlighter language="bash" style={agate}>
                      {codeSnippet}
                    </SyntaxHighlighter>
                  </React.Fragment>
                );
              } else if (webMatch) {
                let webLink = webMatch;
                // Check if the link starts with http:// or https://
                if (!webLink.startsWith('http://') && !webLink.startsWith('https://')) {
                  // Add the http:// protocol
                  webLink = 'http://' + webLink;
                }
                //get the index of the weblink in the original parts array
                const webIndex = parts.indexOf(webMatch);
                //delete the weblink match from the parts array
                parts.splice(webIndex, 1);
                return (
                  <React.Fragment key={index}>
                    {part}
                    <a href={webLink} target="_blank" rel="external noopener noreferrer">
                      {webLink}
                    </a>
                  </React.Fragment>
                );
              }
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
          formData.append("uuid", uuid);
          const response = await axios.post('http://localhost:5001/send_message', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
    
          const data = response.data;
    
          appendMessage('Assistant', data.gpt_response);
          //if (data.gpt_response2)
          if (data.gpt_response2)
            appendMessage('Assistant', data.gpt_response2);
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
      formData.append("uuid", uuid);
      try {
        const response = await axios.post('http://localhost:5001/send_file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        appendMessage('Interpreter', (response.data.system));
        appendMessage('Assistant', (response.data.response));
        appendMessage('Assistant', (response.data.response2));
        if (response.data.code_snippet || response.data.interpreter_output) {
          updateInterpreter(response.data.code_snippet, response.data.interpreter_output.result);
        }
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
  
    const onMouseDown = (e) => {
      e.preventDefault();
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
    
    const onMouseMove = (e) => {
      const chatContainer = document.getElementById("chat-container");
      const interpreterContainer = document.getElementById("interpreter-container");
      const minWidth = 0; 
          
      // Calculate new widths based on the mouse position
      const chatWidth = e.clientX - chatContainer.getBoundingClientRect().left;
      const interpreterWidth = interpreterContainer.getBoundingClientRect().right - e.clientX;
    
      // Update container widths if they are greater than the minimum width
      if (chatWidth > minWidth && interpreterWidth > minWidth) {
        chatContainer.style.width = chatWidth + "%";
        interpreterContainer.style.width = interpreterWidth + "%";
      }
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
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
        <div className="handle" onMouseDown={onMouseDown}></div>
        <div id="interpreter-container">
          <h1 id="python-title">
            Python Interpreter
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
          <div className='snippet-btns'>
              <button id="previous-code" onClick={goToPreviousCode}>
                Previous Code
              </button>
              <button id="next-code" onClick={goToNextCode}>
                Next Code
              </button>
            </div>
        </div>
      </div>
    );
  }


export default ChatInstance;