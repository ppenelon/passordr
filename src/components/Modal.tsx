import React, { ReactNode, useEffect, useState } from "react";
import classNames from "classnames";
import './Modal.css';

export interface IModalProps {
  title: string;
  opened: boolean;
  onClose: () => void;
  className?: string;
  children?: ReactNode;
}

const Modal: React.FC<IModalProps> = ({ title, opened, onClose, className, children }) => {
  const [showElement, setShowElement] = useState(false);

  // Allow to delete element when transition done
  // First spawn modal element => then apply opened class
  // On close, wait for 250ms to remove element (transition time in modal.css)
  useEffect(() => {
    if(opened) setTimeout(() => setShowElement(true));
    else setTimeout(() => setShowElement(false), 250);
  }, [opened]);

  // So when element is neither instanciated neither closing, remove it
  if(!opened && !showElement)
    return null;

  return (
    // Add "opened" class only when opening and showing
    <div className={classNames("modal", { opened: opened && showElement }, className)}>
      <div className="modal-background" onClick={e => onClose()} />
      <div className="modal-body">
        <div className="modal-header">
            <h2 className="modal-header-title">{title}</h2>
            <button className="modal-header-close action-button" onClick={e => onClose()}>
                {/* Font Awesome fa-solid fa-xmark */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"/></svg>
            </button>
        </div>
        <div className="modal-content">
            {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;