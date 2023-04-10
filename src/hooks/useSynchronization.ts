import { LocalFileSynchronizer } from "../synchronizers/localFile.synchronizer";
import { GoogleDriveSynchronizer } from "../synchronizers/googleDrive.synchronizer";
import { SynchronizerType } from "../types/synchronizer.type";
import {
  useCurrentVault,
  useVaultsManagerStore,
} from "../stores/vaultsManager.store";

export function useSynchronization() {
  const currentVault = useCurrentVault();
  const updateCurrentVault = useVaultsManagerStore().updateCurrentVault;

  const localFileSynchronizer = new LocalFileSynchronizer();
  const googleDriveSynchronizer = new GoogleDriveSynchronizer();

  async function backup(synchronizerType: SynchronizerType) {
    switch (synchronizerType) {
      case SynchronizerType.LocalFile:
        const localFileBackupMetada = await localFileSynchronizer.backup(
          currentVault
        );
        updateCurrentVault((vault) => ({
          localFileSynchronizer: localFileBackupMetada,
        }));
        break;
      case SynchronizerType.GoogleDrive:
        const googleDriveBackupMetada = await googleDriveSynchronizer.backup(
          currentVault
        );
        updateCurrentVault((vault) => ({
          googleDriveSynchronizer: googleDriveBackupMetada,
        }));
        break;
    }
  }

  async function restore(backupId: string, synchronizerType: SynchronizerType) {
    switch (synchronizerType) {
      case SynchronizerType.LocalFile:
        const localFileRestoredData = await localFileSynchronizer.restore(
          backupId,
          currentVault
        );
        updateCurrentVault((vault) => localFileRestoredData);
        break;
      case SynchronizerType.GoogleDrive:
        const googleDriveRestoredData = await googleDriveSynchronizer.restore(
          backupId,
          currentVault
        );
        updateCurrentVault((vault) => googleDriveRestoredData);
        break;
    }
  }

  return {
    backup,
    restore,
  };
}
