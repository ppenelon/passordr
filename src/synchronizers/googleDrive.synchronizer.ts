import {
  createFileOnGoogleDrive,
  getFileContentFromGoogleDrive,
} from "../helpers/gapi.helper";
import { extractSynchronizerDataFromVault } from "../helpers/synchronizer.helper";
import { ISynchronizer, SynchronizerType } from "../types/synchronizer.type";
import { IVault } from "../types/vault.type";

export class GoogleDriveSynchronizer
  implements ISynchronizer<SynchronizerType.GoogleDrive>
{
  async backup(vault: IVault) {
    const vaultData = extractSynchronizerDataFromVault(vault);

    await createFileOnGoogleDrive({
      name: vault.clientId,
      description: vault.name,
      body: JSON.stringify(vaultData),
    });

    return {
      lastBackupDate: new Date().toISOString(),
    };
  }

  async restore(backupId: string, vault: IVault) {
    return await getFileContentFromGoogleDrive({ fileId: backupId });
  }
}
