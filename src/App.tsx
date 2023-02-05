import React, { useMemo, useRef, useState, Fragment } from 'react';
import classNames from 'classnames';
import Sidebar from './components/Sidebar';
import { useVaultStore, generateNewService, IVaultHistoryItem, IVaultHistoryItemUpdate } from './stores/vault.store';
import './App.css';

function App() {
  const storedServices = useVaultStore(state => state.services);
  const storedHint = useVaultStore(state => state.hint);
  const setStoredHint = useVaultStore(state => state.setHint);
  const setStoredServices = useVaultStore(state => state.setServices);
  const storeNewHistoryItem = useVaultStore(state => state.addHistoryItem);
  
  const [sidebarOpened, setSidebarOpened] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [hint, setHint] = useState(storedHint);
  const hintLinesCount = useMemo(() => hint.split(/\r\n|\r|\n/).length, [hint]);

  const [services, setServices] = useState(storedServices);
  const servicesInputRef = useRef<(HTMLInputElement | null)[]>([]);

  const editedServicesStatus = useMemo(() => services.map((service, i) => {
    // Handle existing services modifications
    if(i < storedServices.length) {
      // Revive outdated service
      if (storedServices[i].outdated && !service.outdated) {
        return 'added';
      } 
      // Outdate service
      else if (!storedServices[i].outdated && service.outdated) {
        return 'outdate';
      } 
      // Update service content
      else if (storedServices[i].name !== service.name) {
        return 'update';
      }
    } 
    // Handle new services
    else {
      // Check last service creation (the new one at the bottom)
      if(i === services.length - 1) {
        return service.name ? 'added' : false;
      }
      // Anything else has been added
      else {
        return 'added'
      }
    }
    // Service not updated
    return false;
  }), [services, storedServices]);

  function goEditMode() {
    setServices(services => [...services, generateNewService()]);
    setEditMode(true);
  }

  function goSave() {
    const servicesWithoutNew = services.slice(0, services.length - 1);
    const historyItem: IVaultHistoryItem = {
      timestamp: new Date().toISOString(),
      updates: services.reduce<IVaultHistoryItemUpdate[]>((editedServices, service, i) => {
        if(editedServicesStatus[i]) {
          editedServices.push({
            serviceIndex: i,
            type: editedServicesStatus[i] as IVaultHistoryItemUpdate['type'],
            serviceNameFrom: storedServices[i] ? storedServices[i].name : '',
            serviceNameTo: service.name,
          });
        }
        return editedServices;
      }, [])
    };

    setStoredHint(hint);
    setServices(servicesWithoutNew);
    setStoredServices(servicesWithoutNew);
    storeNewHistoryItem(historyItem)
    setEditMode(false);
  };

  function goCancel() {
    setHint(storedHint);
    setServices(storedServices);
    setEditMode(false);
  }
  
  function toggleServiceOutdated(serviceIndex: number) {
    setServices(services => {
      const newServices = [...services];
      newServices[serviceIndex] = { ...newServices[serviceIndex], outdated: !newServices[serviceIndex].outdated };
      return newServices;
    });
  }

  function setServiceName(serviceIndex: number, value: string) {
    setServices(services => {
      const newServices = [...services];
      newServices[serviceIndex] = { ...newServices[serviceIndex], name: value };
      if (serviceIndex === services.length - 1) {
        newServices.push({ name: '', outdated: false });
      }
      return newServices;
    });
  }

  function deleteService(serviceIndex: number) { 
    setServices(services => {
      const newServices = [...services];
      newServices.splice(serviceIndex, 1);
      return newServices;
    });
  }

  function jumpToInput(serviceIndex: number) {
    servicesInputRef.current[serviceIndex]?.focus();
  }

  function handleKey(event: React.KeyboardEvent<HTMLInputElement>, serviceIndex: number) {
    switch (event.key) {
      case "Enter":
      case "ArrowDown":
        jumpToInput(serviceIndex + 1);
        break;
      case "ArrowUp":
        jumpToInput(serviceIndex - 1);
        break;
      case "Backspace":
        if (
          // Has no name
          !services[serviceIndex].name && 
          // Is new service
          serviceIndex >= storedServices.length && 
          // Is not the last service (the new one)
          serviceIndex < services.length - 1
        ) {
          jumpToInput(serviceIndex - 1);
          deleteService(serviceIndex);
          event.preventDefault();
        }
        break;
    }
  }

  return (
    <div className="App">
      {/* Sidebar */}
      <Sidebar
        opened={sidebarOpened}
        onClose={() => setSidebarOpened(false)}
      />

      {/* Header */}
      <div className="header">
        {/* Title */}
        <button className="title action-button" onClick={e => setSidebarOpened(true)}>
          {/* Font Awesome fa-solid fa-bars */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/></svg>
          passordr
        </button>

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

      <div className="content">
        {/* Hint */}
        <div className="category-name"><div>HINT</div></div>
        <div className={classNames("hint", { edited: editMode && storedHint !== hint })}>
          <textarea
            value={hint}
            rows={hintLinesCount}
            onChange={e => setHint(e.target.value)}
            readOnly={!editMode}
          />
        </div>

        {/* Services */}
        <div className="category-name"><div>SERVICES</div></div>
        <div className={classNames("services", { 'edit-mode': editMode })}>
          {services.map((service, i) =>
            <div className={classNames("service", { outdated: service.outdated, new: editMode && i === services.length - 1 }, editMode && editedServicesStatus[i] && ["edited", editedServicesStatus[i]])} key={i}>
              <div className="index" onClick={e => editMode && toggleServiceOutdated(i)}>{i}</div>
              <input
                className="title"
                ref={el => servicesInputRef.current[i] = el}
                value={service.name}
                onChange={e => editMode && setServiceName(i, e.target.value)}
                onKeyDown={e => handleKey(e, i)}
                readOnly={!editMode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
