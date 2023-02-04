import React, { useMemo, useReducer, useRef, useState, Fragment } from 'react';
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

  const [savedContent, updateSavedContent] = useReducer(() => ({ hint: hint, lines: [...lines] }), { hint: hint, lines: [...lines] });
  const editedLinesStatus = useMemo(() => lines.map((line, i) => {
    if (i === savedContent.lines.length - 1 && lines[i].name) {
      return 'added';
    } else if (!savedContent.lines[i]) {
      return 'added';
    } else if (savedContent.lines[i].outdated && !line.outdated) {
      return 'added';
    } else if (!savedContent.lines[i].outdated && line.outdated) {
      return 'outdate';
    } else if (savedContent.lines[i].name !== line.name) {
      return 'update';
    }
    return false;
  }), [lines, savedContent]);

  function goEditMode() {
    setEditMode(true);
    updateSavedContent();
  }

  function goSave() {
    setEditMode(false);
  }

  function goCancel() {
    setHint(savedContent.hint);
    setLines(savedContent.lines);
    setEditMode(false);
  }
  
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
      if (index === lines.length - 1) {
        newLines.push({ name: '', outdated: false });
      }
      return newLines;
    });
  }

  function deleteLine(lineIndex: number) {
    setLines(lines => {
      const newLines = [...lines];
      newLines.splice(lineIndex, 1);
      return newLines;
    });
  }

  function jumpToInput(inputIndex: number) {
    linesInputRef.current[inputIndex]?.focus();
  }

  function handleKey(event: React.KeyboardEvent<HTMLInputElement>, lineIndex: number) {
    switch (event.key) {
      case "Enter":
      case "ArrowDown":
        jumpToInput(lineIndex + 1);
        break;
      case "ArrowUp":
        jumpToInput(lineIndex - 1);
        break;
      case "Backspace":
        if (!lines[lineIndex].name.length && lineIndex >= savedContent.lines.length) {
          jumpToInput(lineIndex - 1);
          deleteLine(lineIndex);
          event.preventDefault();
        }
        break;
    }
  }

  return (
    <div className="App">
      {/* Header */}
      <div className="header">
        {/* Title */}
        <div className="title">
          passordr
        </div>

        {/* Toogle edit mode */}
        <div className="edit-toggle">
          {
            editMode ?
              (<Fragment>
                <button onClick={e => goCancel()}>CANCEL</button>
                <button onClick={e => goSave()}>SAVE</button>
              </Fragment>) :
              (<button onClick={e => goEditMode()}>EDIT</button>)
          }
        </div>
      </div>

      {/* Hint */}
      <div className={classNames("hint", { edited: editMode && savedContent.hint !== hint })}>
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
          <div className={classNames("line", { outdated: line.outdated, new: i === lines.length - 1 }, editMode && editedLinesStatus[i] && ["edited", editedLinesStatus[i]])} key={i}>
            <div className="index" onClick={e => editMode && toggleLineOutdated(i)}>{i}</div>
            <input
              className="title"
              ref={el => linesInputRef.current[i] = el}
              value={line.name}
              onChange={e => editMode && setLineContent(i, e.target.value)}
              onKeyDown={e => handleKey(e, i)}
              readOnly={!editMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
