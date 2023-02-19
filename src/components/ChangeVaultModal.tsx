import React from "react";
import { ModalType, useInteractionsStore } from "../stores/interactions.store";
import Modal from "./Modal";
import {
  useCurrentVault,
  useVaultsManagerStore,
} from "../stores/vaultsManager.store";
import { generateNewVault } from "../helpers/vault.helper";
import { IVault } from "../types/vault.type";
import "./ChangeVaultModal.css";

const ChangeVaultModal: React.FC = () => {
  const openedModal = useInteractionsStore((state) => state.openedModal);
  const closeModal = useInteractionsStore((state) => state.closeModal);
  const closeSidebar = useInteractionsStore((state) => state.closeSidebar);

  const storedVaults = useVaultsManagerStore((state) => state.storedVaults);
  const storeNewVault = useVaultsManagerStore((state) => state.storeNewVault);
  const changeCurrentVault = useVaultsManagerStore(
    (state) => state.changeCurrentVault
  );
  const renameStoredVault = useVaultsManagerStore((state) => state.renameVault);
  const deleteStoredVault = useVaultsManagerStore((state) => state.deleteVault);

  const currentVault = useCurrentVault();

  function openVault(vault: IVault) {
    changeCurrentVault(vault.clientId);
    closeModal();
    closeSidebar();
  }

  function renameVault(vault: IVault) {
    const newVaultName = prompt("Please enter new vault name", vault.name);
    if (newVaultName && newVaultName.trim()) {
      renameStoredVault(vault.clientId, newVaultName.trim());
    }
  }

  function deleteVault(vault: IVault) {
    const confirmDelete = window.confirm(
      `Are you sure to delete this vault (${vault.name}) ?`
    );
    if (confirmDelete) {
      deleteStoredVault(vault.clientId);
    }
  }

  function createNewVault() {
    const newVault = generateNewVault();
    storeNewVault(newVault, { insertAndSelect: true });
    closeModal();
    closeSidebar();
  }

  return (
    <Modal
      title="Change vault"
      className="change-vault-modal"
      opened={openedModal === ModalType.ChangeVault}
      onClose={() => closeModal()}
    >
      <ul>
        {storedVaults.map((vault) => (
          <li className="vault-item" key={vault.clientId}>
            <h3>
              <span>
                {/* Font Awesome fa-solid fa-vault */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                  <path d="M64 0C28.7 0 0 28.7 0 64V416c0 35.3 28.7 64 64 64H80l16 32h64l16-32H400l16 32h64l16-32h16c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM224 320c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80zm0 80c-88.4 0-160-71.6-160-160s71.6-160 160-160s160 71.6 160 160s-71.6 160-160 160zM480 221.3V336c0 8.8-7.2 16-16 16s-16-7.2-16-16V221.3c-18.6-6.6-32-24.4-32-45.3c0-26.5 21.5-48 48-48s48 21.5 48 48c0 20.9-13.4 38.7-32 45.3z" />
                </svg>

                {vault.name}

                {vault.clientId === currentVault.clientId && (
                  <span className="current-vault">CURRENT</span>
                )}
              </span>
              <span className="vault-last-update">
                Last update:{" "}
                {vault.history.length > 0
                  ? new Date(vault.history[0].timestamp).toLocaleString()
                  : "Never"}
              </span>
            </h3>

            <button className="action-button" onClick={() => openVault(vault)}>
              &gt; Open vault
            </button>

            <button
              className="action-button"
              onClick={() => renameVault(vault)}
            >
              &gt; Rename vault
            </button>

            <button
              className="action-button"
              disabled={storedVaults.length === 1}
              title={
                storedVaults.length === 1
                  ? "You must have at least one vault"
                  : undefined
              }
              onClick={() => deleteVault(vault)}
            >
              &gt; Delete vault
            </button>
          </li>
        ))}
        <li className="new-vault">
          <button className="action-button" onClick={() => createNewVault()}>
            + Create new vault
          </button>
        </li>
      </ul>
    </Modal>
  );
};

export default ChangeVaultModal;
