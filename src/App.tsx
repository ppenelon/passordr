import { useState, Fragment, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import HistoryModal from "./components/HistoryModal";
import "./App.css";
import { useInteractionsStore } from "./stores/interactions.store";
import { IVaultData } from "./types/vault.type";
import {
  useCurrentVault,
  useVaultsManagerStore,
} from "./stores/vaultsManager.store";
import ChangeVaultModal from "./components/ChangeVaultModal";
import ParametersModal from "./components/ParametersModal";
import BackupModal from "./components/BackupModal";
import VaultContent from "./components/VaultContent";
import VaultLock from "./components/VaultLock";
import Loader from "./components/Loader";

function App() {
  const currentVault = useCurrentVault();
  const currentVaultClientId = useVaultsManagerStore(
    (state) => state.currentVaultClientId
  );

  const openSidebar = useInteractionsStore((state) => state.openSidebar);
  const isAppLoading = useInteractionsStore((state) => state.isAppLoading);
  const setAppLoading = useInteractionsStore((state) => state.setAppLoading);
  const setAppLoaded = useInteractionsStore((state) => state.setAppLoaded);

  const openedVaultData = useVaultsManagerStore((state) => state.vaultData);
  const saveCurrentVaultData = useVaultsManagerStore(
    (state) => state.saveCurrentVaultData
  );

  const openVault = useVaultsManagerStore((state) => state.openVault);
  const closeVault = useVaultsManagerStore((state) => state.closeVault);
  const [editMode, setEditMode] = useState(false);

  const [vaultEditedData, setVaultEditedData] = useState<IVaultData>({
    hint: "",
    services: [],
    history: [],
  });

  // Reset view when changing vault
  useEffect(() => {
    setAppLoading();
    setEditMode(false);
    setVaultEditedData({
      hint: "",
      services: [],
      history: [],
    });

    if (!currentVault.password) {
      openVault(currentVault, "").then(() => setAppLoaded());
    } else {
      closeVault();
      setAppLoaded();
    }
  }, [currentVaultClientId]);

  // Reset view when vault open/close
  useEffect(() => {
    setEditMode(false);
    setVaultEditedData({
      hint: openedVaultData ? openedVaultData.hint : "",
      services: openedVaultData ? openedVaultData.services : [],
      history: openedVaultData ? openedVaultData.history : [],
    });
  }, [openedVaultData]);

  function goEditMode() {
    setEditMode(true);
  }

  async function goSave() {
    await saveCurrentVaultData(vaultEditedData);
    setEditMode(false);
  }

  function goCancel() {
    setVaultEditedData(openedVaultData!);
    setEditMode(false);
  }

  return (
    <div className="App">
      {/* Loader */}
      {isAppLoading && <Loader />}

      {/* Modals */}
      <HistoryModal />
      <ChangeVaultModal />
      <BackupModal />
      <ParametersModal />

      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <div className="header">
        {/* Title */}
        <button className="title action-button" onClick={(e) => openSidebar()}>
          {/* Font Awesome fa-solid fa-bars */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z" />
          </svg>
          passordr
        </button>

        {/* Toogle edit mode */}
        {openedVaultData && (
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
        )}
      </div>

      {openedVaultData ? (
        <VaultContent
          editMode={editMode}
          vaultData={openedVaultData}
          onVaultDataUpdate={(vaultData) => setVaultEditedData(vaultData)}
        />
      ) : (
        currentVault.password && <VaultLock />
      )}
    </div>
  );
}

export default App;
