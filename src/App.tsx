import React, { useMemo, useReducer, useRef, useState } from 'react';
import classNames from 'classnames';
import './App.css';

const dbLines = Array(100).fill({ name: "My Service", outdated: false }).map((line, index) => ({ ...line, name: line.name + index, outdated: Math.random() > 0.9 }));
const dbHint = "Hello\nBoys";

function App() {
  const [editMode, setEditMode] = useState(false);
  
  const [hint, setHint] = useState(dbHint);
  const hintLinesCount = useMemo(() => hint.split(/\r\n|\r|\n/).length, [hint]);

  const [lines, setLines] = useState([...dbLines, { name: "", outdated: false }]);
  const linesInputRef = useRef<(HTMLInputElement | null)[]>([]);

  const [savedContent, updateSavedContent] = useReducer(() => ({ hint: hint, lines: [...lines]}), ({ hint: hint, lines: [...lines]}));

  function toggleLineOutdated(lineIndex: number) {
    setLines(lines => {
      const newLines = [...lines];
      newLines[lineIndex] = { ...newLines[lineIndex], outdated: !newLines[lineIndex].outdated };
      return newLines;
    });
  }
  
  function setLineContent(index: number, value: string) {
    setLines(lines => {
      const newLines = [...lines];
      newLines[index] = { ...newLines[index], name: value };
      if(index === lines.length - 1) {
        newLines.push('');
      }
      return newLines;
    });
  }

  function jumpToInput(inputIndex: number) {
    linesInputRef.current[inputIndex]?.focus();
  }

  function handleKeyMovement(key: string, currentInputIndex: number) {
    switch(key) {
      case "Enter":
      case "ArrowDown":
        jumpToInput(currentInputIndex + 1);
        break;
      case "ArrowUp":
        jumpToInput(currentInputIndex - 1);
        break;
    }
  }

  return (
    <div className="App">
      {/* Header */}
      <div className="header">
        {/* Title */}
        <div className="title">
          Passordr
        </div>

        {/* Toogle edit mode */}
        <div className="edit-mode">
          <label>
            Edit mode
            <input type="checkbox" checked={editMode} onChange={e => {setEditMode(e.target.checked); updateSavedContent()}} />
          </label>
        </div>
      </div>

      {/* Hint */}
      <div className="hint">
        <textarea
          value={hint}
          rows={hintLinesCount}
          onChange={e => setHint(e.target.value)}
          readOnly={!editMode}
        />
      </div>

      {/* Lines / Services */}
      <div className={classNames("lines", { 'edit-mode': editMode })}>
        {lines.map((line, i) => 
          <div className={classNames("line", { outdated: line.outdated, new: i === lines.length - 1 })} key={i}>
            <div className="index" onClick={e => editMode && toggleLineOutdated(i)}>{i}</div>
            <input 
              className="title"
              ref={el => linesInputRef.current[i] = el}
              value={line.name}
              onChange={e => editMode && setLineContent(i, e.target.value)}
              onKeyDown={e => handleKeyMovement(e.key, i)}
              readOnly={!editMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
