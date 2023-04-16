import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { agate } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);

const Interpreter = ({ uuid, codeSnippets, snippetIndex, goToPreviousCode, goToNextCode }) => {
  return (
    <div className={'interpreter-container'} id={`interpreter-container-${uuid}`}>
      <h1 id="python-title">Code</h1>
      <div id="interpreter-area">
        {snippetIndex >= 0 && (
          <SyntaxHighlighter language="python" style={agate}>
            {codeSnippets[snippetIndex].code}
          </SyntaxHighlighter>
        )}
      </div>
      <h2>Console</h2>
      <div id="interpreter-output">
        {snippetIndex >= 0 && (
          <SyntaxHighlighter language="bash" style={agate}>
            {`user@gpt-x:~$\n${codeSnippets[snippetIndex].output}`}
          </SyntaxHighlighter>
        )}
      </div>
      <div className="snippet-btns">
        <button id="previous-code" onClick={goToPreviousCode}>
          Previous Code
        </button>
        <button id="next-code" onClick={goToNextCode}>
          Next Code
        </button>
      </div>
    </div>
  );
};

export default Interpreter;
