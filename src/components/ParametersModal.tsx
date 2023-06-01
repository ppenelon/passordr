import React, { useState } from "react";
import { ModalType, useInteractionsStore } from "../stores/interactions.store";
import Modal from "./Modal";
import "./HistoryModal.css";
import "./ParametersModal.css";
import {
  useCurrentVault,
  useVaultsManagerStore,
} from "../stores/vaultsManager.store";

const keepVaultOpenOptions = [
  { value: 0, name: "Keep open" },
  { value: 60 * 1000, name: "1 minute without activity" },
  { value: 5 * 60 * 1000, name: "5 minutes without activity" },
  { value: 10 * 60 * 1000, name: "10 minutes without activity" },
  { value: 30 * 60 * 1000, name: "30 minutes without activity" },
];

const ParametersModal: React.FC = () => {
  const openedModal = useInteractionsStore((state) => state.openedModal);
  const closeModal = useInteractionsStore((state) => state.closeModal);

  const currentVault = useCurrentVault();
  const openedVaultData = useVaultsManagerStore((state) => state.vaultData);
  const updateVaultPassword = useVaultsManagerStore(
    (state) => state.updateVaultPassword
  );
  const keepVaultOpen = useVaultsManagerStore((state) => state.keepVaultOpen);

  const setPasswordValidity = useVaultsManagerStore(
    (state) => state.setPasswordValidity
  );
  const passwordValidity = useVaultsManagerStore(
    (state) => state.passwordValidity
  );

  const [oldVaultPassword, setOldVaultPassword] = useState("");
  const [newVaultPassword, setNewVaultPassword] = useState("");

  function updatePasswordValidity(validity: number) {
    setPasswordValidity(validity);
    keepVaultOpen();
  }

  async function updateCurrentVaultPassword() {
    if (
      oldVaultPassword &&
      !newVaultPassword &&
      !confirm("Are you sure to disable vault password?")
    ) {
      return;
    }

    try {
      await updateVaultPassword(oldVaultPassword, newVaultPassword);
      keepVaultOpen();

      setOldVaultPassword("");
      setNewVaultPassword("");
    } catch (error) {
      alert((error as Error).message);
    }
  }

  return (
    <Modal
      title={`Parameters`}
      className="parameters-modal"
      opened={openedModal === ModalType.Parameters}
      onClose={() => closeModal()}
    >
      {openedVaultData && (
        <fieldset>
          <legend>Change vault password</legend>
          <input
            type="password"
            placeholder="Old vault password"
            value={oldVaultPassword}
            onChange={(e) => setOldVaultPassword(e.target.value)}
            disabled={!currentVault.password}
          />
          <input
            type="password"
            placeholder="New vault password"
            value={newVaultPassword}
            onChange={(e) => setNewVaultPassword(e.target.value)}
          />
          <button
            onClick={() => updateCurrentVaultPassword()}
            disabled={currentVault.password && !oldVaultPassword}
          >
            Update password
          </button>
        </fieldset>
      )}
      <fieldset>
        <legend>Automatically close password protected vault</legend>
        <select
          defaultValue={passwordValidity}
          onChange={(e) => updatePasswordValidity(parseInt(e.target.value))}
        >
          {keepVaultOpenOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
      </fieldset>
    </Modal>
  );
};

export default ParametersModal;
