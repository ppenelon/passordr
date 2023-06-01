import React, { useMemo, useRef, useState, useEffect } from "react";
import classNames from "classnames";
import "./VaultContent.css";
import { useVaultsManagerStore } from "../stores/vaultsManager.store";
import {
  IVaultData,
  IVaultHistoryItem,
  IVaultHistoryItemUpdate,
  VaultHistoryItemUpdateType,
} from "../types/vault.type";
import { generateNewService } from "../helpers/vault.helper";

export interface IVaultContentProps {
  vaultData: IVaultData;
  editMode: boolean;
  onVaultDataUpdate: (vaultData: IVaultData) => void;
}

const VaultContent: React.FC<IVaultContentProps> = ({
  vaultData: {
    hint: storedHint,
    services: storedServices,
    history: storedHistory,
  },
  editMode,
  onVaultDataUpdate,
}) => {
  const keepVaultOpen = useVaultsManagerStore((state) => state.keepVaultOpen);

  const [hint, setHint] = useState(storedHint);
  const hintLinesCount = useMemo(() => hint.split(/\r\n|\r|\n/).length, [hint]);

  const [services, setServices] = useState(storedServices);
  const servicesInputRef = useRef<(HTMLInputElement | null)[]>([]);

  const editedServicesStatus = useMemo(
    () =>
      services.map((service, i) => {
        // Handle existing services modifications
        if (i < storedServices.length) {
          // Revive outdated service
          if (storedServices[i].outdated && !service.outdated) {
            return VaultHistoryItemUpdateType.Added;
          }
          // Outdate service
          else if (!storedServices[i].outdated && service.outdated) {
            return VaultHistoryItemUpdateType.Outdate;
          }
          // Update service content
          else if (storedServices[i].name !== service.name) {
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
    [services, storedServices]
  );

  // Keep vault open / password alive on any action
  useEffect(() => {
    keepVaultOpen();
  }, [hint, services, editMode]);

  // Forward data to parent on vault update
  useEffect(() => {
    if (editMode) {
      const servicesWithoutNew = services.slice(0, services.length - 1);
      const historyItem: IVaultHistoryItem = {
        timestamp: new Date().toISOString(),
        hint:
          storedHint !== hint
            ? {
                hintFrom: storedHint,
                hintTo: hint,
              }
            : undefined,
        updates: services.reduce<IVaultHistoryItemUpdate[]>(
          (editedServices, service, i) => {
            if (editedServicesStatus[i]) {
              editedServices.push({
                serviceIndex: i,
                type: editedServicesStatus[
                  i
                ] as IVaultHistoryItemUpdate["type"],
                serviceNameFrom: storedServices[i]
                  ? storedServices[i].name
                  : "",
                serviceNameTo: service.name,
              });
            }
            return editedServices;
          },
          []
        ),
      };

      onVaultDataUpdate({
        hint: hint,
        services: servicesWithoutNew,
        history: [...storedHistory, historyItem],
      });
    }
  }, [hint, services, editMode]);

  // Start/Stop edit mode
  useEffect(() => {
    if (editMode) {
      setServices((services) => [...services, generateNewService()]);
    } else {
      setHint(storedHint);
      setServices(storedServices);
    }
  }, [editMode]);

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
    <div className="vault-content">
      {/* Hint */}
      <div className="category-name">
        <div>HINT</div>
      </div>
      <div
        className={classNames("hint", {
          edited: editMode && storedHint !== hint,
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
                i < storedServices.length &&
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
  );
};

export default VaultContent;
