import React from "react";
import classNames from "classnames";
import "./Sidebar.css";

interface ISidebarProps {
  opened: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<ISidebarProps> = ({ opened, onClose }) => {
  return (
    <div className={classNames("sidebar", { opened })}>
      <div className="sidebar-background" onClick={e => onClose()} />
      <div className="sidebar-body">
        <div className="sidebar-header">
          <div className="sidebar-header-title"> MENU </div>
          <div className="sidebar-header-close" onClick={e => onClose()}>&lt;&lt;&lt;</div>
        </div>
        <div className="sidebar-content">
          I'm a sidebar!
        </div>
      </div>
    </div>
  );
}

export default Sidebar;