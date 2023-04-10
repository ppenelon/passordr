import React, { ChangeEvent, useMemo, useState } from "react";
import { ModalType, useInteractionsStore } from "../stores/interactions.store";
import Modal from "./Modal";
import "./BackupModal.css";
import { useSynchronization } from "../hooks/useSynchronization";
import { SynchronizerType } from "../types/synchronizer.type";
import { useCurrentVault } from "../stores/vaultsManager.store";
import {
  deleteFileFromGoogleDrive,
  listFilesFromGoogleDrive,
} from "../helpers/gapi.helper";

type GoogleDriveBackupData = Awaited<
  ReturnType<typeof listFilesFromGoogleDrive>
>;

const ParametersModal: React.FC = () => {
  const openedModal = useInteractionsStore((state) => state.openedModal);
  const closeModal = useInteractionsStore((state) => state.closeModal);
  const setAppLoading = useInteractionsStore((state) => state.setAppLoading);
  const setAppLoaded = useInteractionsStore((state) => state.setAppLoaded);

  const currentVault = useCurrentVault();

  const { backup, restore } = useSynchronization();

  const lastLocalFileBackup = useMemo(
    () =>
      currentVault.localFileSynchronizer?.lastBackupDate
        ? new Date(
            currentVault.localFileSynchronizer?.lastBackupDate
          ).toLocaleString()
        : "N/A",
    [currentVault.localFileSynchronizer]
  );

  const lastGoogleDriveBackup = useMemo(
    () =>
      currentVault.googleDriveSynchronizer?.lastBackupDate
        ? new Date(
            currentVault.googleDriveSynchronizer?.lastBackupDate
          ).toLocaleString()
        : "Never",
    [currentVault.googleDriveSynchronizer]
  );

  const [backupsList, setBackupsList] = useState<GoogleDriveBackupData>([]);
  const [selectedBackupsId, setSelectedBackupsId] = useState<string[]>([]);

  async function loadBackupsList() {
    const filesList = await listFilesFromGoogleDrive();
    setBackupsList(
      filesList.map((file) => ({
        ...file,
        modifiedTime: new Date(file.modifiedTime).toLocaleString(),
      }))
    );
  }

  function updateSelectedBackups(event: ChangeEvent<HTMLSelectElement>) {
    const selectedBackupsId: string[] = [];
    for (const option of event.target.options) {
      if (option.selected) {
        selectedBackupsId.push(option.value);
      }
    }
    setSelectedBackupsId(selectedBackupsId);
  }

  async function deleteSelectedGoogleDriveBackups() {
    for (const selectedBackupId of selectedBackupsId) {
      await deleteFileFromGoogleDrive({
        fileId: selectedBackupId,
      });
    }

    await loadBackupsList();
    setSelectedBackupsId([]);
  }

  return (
    <Modal
      title={`Backup/Restore vault`}
      className="backup-modal"
      opened={openedModal === ModalType.Backup}
      onClose={() => closeModal()}
    >
      <div className="local-file-synchronizer">
        <h3>
          💾 Local file <small>Last at {lastLocalFileBackup}</small>
        </h3>
        <div className="synchronizer-actions">
          <button
            className="action-button"
            onClick={() => backup(SynchronizerType.LocalFile)}
          >
            📤 Save vault
          </button>
          <button
            className="action-button"
            onClick={() => restore("", SynchronizerType.LocalFile)}
          >
            📥 Recover from file
          </button>
        </div>
      </div>
      <div className="google-drive-synchronizer">
        <h3>
          ♻️ Google Drive <small>Last at {lastGoogleDriveBackup}</small>
        </h3>
        <div className="synchronizer-actions">
          <button
            className="action-button"
            onClick={async () => {
              setAppLoading();
              await backup(SynchronizerType.GoogleDrive).catch();
              await loadBackupsList().catch();
              setAppLoaded();
            }}
          >
            📤 Export vault to Drive
          </button>
          <button
            className="action-button"
            onClick={async () => {
              setAppLoading();
              await loadBackupsList().catch();
              setAppLoaded();
            }}
          >
            🔄 Load backups list
          </button>
        </div>

        {backupsList.length > 0 && (
          <div className="google-drive-backups">
            <select multiple onChange={updateSelectedBackups}>
              {backupsList.map((backup) => (
                <option key={backup.id} value={backup.id}>
                  {backup.description || "Unnamed"} ({backup.modifiedTime})
                </option>
              ))}
            </select>

            <div className="synchronizer-actions">
              <button
                className="action-button"
                onClick={async () => {
                  setAppLoading();
                  await deleteSelectedGoogleDriveBackups().catch();
                  setAppLoaded();
                }}
                disabled={selectedBackupsId.length === 0}
              >
                🗑️ Delete selected backups
              </button>
              <button
                className="action-button"
                onClick={async () => {
                  setAppLoading();
                  await restore(
                    selectedBackupsId[0],
                    SynchronizerType.GoogleDrive
                  ).catch();
                  setAppLoaded();
                }}
                disabled={selectedBackupsId.length !== 1}
              >
                📥 Import selected backup
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ParametersModal;
