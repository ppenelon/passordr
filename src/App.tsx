import React, { useMemo, useRef, useState, Fragment, useEffect } from "react";
import classNames from "classnames";
import Sidebar from "./components/Sidebar";
import HistoryModal from "./components/HistoryModal";
import "./App.css";
import { useInteractionsStore } from "./stores/interactions.store";
import {
  IVaultHistoryItem,
  IVaultHistoryItemUpdate,
  VaultHistoryItemUpdateType,
} from "./types/vault.type";
import { generateNewService } from "./helpers/vault.helper";
import {
  useCurrentVault,
  useVaultsManagerStore,
} from "./stores/vaultsManager.store";
import ChangeVaultModal from "./components/ChangeVaultModal";
import ParametersModal from "./components/ParametersModal";
import BackupModal from "./components/BackupModal";

function App() {
  const currentVault = useCurrentVault();
  const updateCurrentStoredVault = useVaultsManagerStore(
    (state) => state.updateCurrentVault
  );

  const openSidebar = useInteractionsStore((state) => state.openSidebar);
  const isAppLoading = useInteractionsStore((state) => state.isAppLoading);

  const [editMode, setEditMode] = useState(false);

  const [hint, setHint] = useState(currentVault.hint);
  const hintLinesCount = useMemo(() => hint.split(/\r\n|\r|\n/).length, [hint]);

  const [services, setServices] = useState(currentVault.services);
  const servicesInputRef = useRef<(HTMLInputElement | null)[]>([]);

  const editedServicesStatus = useMemo(
    () =>
      services.map((service, i) => {
        // Handle existing services modifications
        if (i < currentVault.services.length) {
          // Revive outdated service
          if (currentVault.services[i].outdated && !service.outdated) {
            return VaultHistoryItemUpdateType.Added;
          }
          // Outdate service
          else if (!currentVault.services[i].outdated && service.outdated) {
            return VaultHistoryItemUpdateType.Outdate;
          }
          // Update service content
          else if (currentVault.services[i].name !== service.name) {
            return VaultHistoryItemUpdateType.Update;
          }
        }
        // Handle new services
        else {
          // Check last service creation (the new one at the bottom)
          if (i === services.length - 1) {
            return service.name ? VaultHistoryItemUpdateType.Added : false;
          }
          // Anything else has been added
          else {
            return VaultHistoryItemUpdateType.Added;
          }
        }
        // Service not updated
        return false;
      }),
    [services, currentVault.services]
  );

  // Reset view when changing vault
  useEffect(() => {
    setHint(currentVault.hint);
    setServices(currentVault.services);
    setEditMode(false);
  }, [currentVault]);

  function goEditMode() {
    setServices((services) => [...services, generateNewService()]);
    setEditMode(true);
  }

  function goSave() {
    const servicesWithoutNew = services.slice(0, services.length - 1);
    const historyItem: IVaultHistoryItem = {
      timestamp: new Date().toISOString(),
      hint:
        currentVault.hint !== hint
          ? {
              hintFrom: currentVault.hint,
              hintTo: hint,
            }
          : undefined,
      updates: services.reduce<IVaultHistoryItemUpdate[]>(
        (editedServices, service, i) => {
          if (editedServicesStatus[i]) {
            editedServices.push({
              serviceIndex: i,
              type: editedServicesStatus[i] as IVaultHistoryItemUpdate["type"],
              serviceNameFrom: currentVault.services[i]
                ? currentVault.services[i].name
                : "",
              serviceNameTo: service.name,
            });
          }
          return editedServices;
        },
        []
      ),
    };

    updateCurrentStoredVault((vault) => ({
      ...vault,
      hint: hint,
      services: servicesWithoutNew,
      history: [...vault.history, historyItem],
    }));

    setServices(servicesWithoutNew);
    setEditMode(false);
  }

  function goCancel() {
    setHint(currentVault.hint);
    setServices(currentVault.services);
    setEditMode(false);
  }

  function toggleServiceOutdated(serviceIndex: number) {
    setServices((services) => {
      const newServices = [...services];
      newServices[serviceIndex] = {
        ...newServices[serviceIndex],
        outdated: !newServices[serviceIndex].outdated,
      };
      return newServices;
    });
  }

  function setServiceName(serviceIndex: number, value: string) {
    setServices((services) => {
      const newServices = [...services];
      newServices[serviceIndex] = { ...newServices[serviceIndex], name: value };
      if (serviceIndex === services.length - 1) {
        newServices.push({ name: "", outdated: false });
      }
      return newServices;
    });
  }

  function deleteService(serviceIndex: number) {
    setServices((services) => {
      const newServices = [...services];
      newServices.splice(serviceIndex, 1);
      return newServices;
    });
  }

  function jumpToInput(serviceIndex: number) {
    servicesInputRef.current[serviceIndex]?.focus();
  }

  function handleKey(
    event: React.KeyboardEvent<HTMLInputElement>,
    serviceIndex: number
  ) {
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
          serviceIndex >= currentVault.services.length &&
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
      {/* Modals */}
      <HistoryModal />
      <ChangeVaultModal />
      <BackupModal />
      <ParametersModal />

      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <div className={classNames("header", { loading: isAppLoading })}>
        {/* Title */}
        <button className="title action-button" onClick={(e) => openSidebar()}>
          {/* Font Awesome fa-solid fa-bars */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
          </svg>
          passordr
        </button>

        {/* Toogle edit mode */}
        <div className="edit-toggle">
          {editMode ? (
            <Fragment>
              <button onClick={(e) => goCancel()}>CANCEL</button>
              <button onClick={(e) => goSave()}>SAVE</button>
            </Fragment>
          ) : (
            <button onClick={(e) => goEditMode()}>EDIT</button>
          )}
        </div>
      </div>

      <div className="content">
        {/* Hint */}
        <div className="category-name">
          <div>HINT</div>
        </div>
        <div
          className={classNames("hint", {
            edited: editMode && currentVault.hint !== hint,
          })}
        >
          <textarea
            value={hint}
            rows={hintLinesCount}
            onChange={(e) => setHint(e.target.value)}
            readOnly={!editMode}
          />
        </div>

        {/* Services */}
        <div className="category-name">
          <div>SERVICES</div>
        </div>
        <div className={classNames("services", { "edit-mode": editMode })}>
          {services.map((service, i) => (
            <div
              className={classNames(
                "service",
                {
                  outdated: service.outdated,
                  new: editMode && i === services.length - 1,
                },
                editMode &&
                  editedServicesStatus[i] && ["edited", editedServicesStatus[i]]
              )}
              key={i}
            >
              <div
                className="index"
                onClick={(e) =>
                  editMode &&
                  i < currentVault.services.length &&
                  toggleServiceOutdated(i)
                }
              >
                {i}
              </div>
              <input
                className="title"
                ref={(el) => (servicesInputRef.current[i] = el)}
                value={service.name}
                onChange={(e) => editMode && setServiceName(i, e.target.value)}
                onKeyDown={(e) => handleKey(e, i)}
                readOnly={!editMode}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
