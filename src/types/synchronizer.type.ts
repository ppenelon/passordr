import {
  IVault,
  IVaultGoogleDriveBackup,
  IVaultLocalFileBackup,
} from "./vault.type";

export enum SynchronizerType {
  LocalFile = "local-file",
  GoogleDrive = "google-drive",
}

export type ISynchronizerData = Pick<IVault, "password" | "encryptedData">;

type IVaultBackupMetadata<T extends SynchronizerType> =
  T extends SynchronizerType.GoogleDrive
    ? IVaultGoogleDriveBackup
    : IVaultLocalFileBackup;

export interface ISynchronizer<T extends SynchronizerType> {
  backup(vault: IVault): Promise<IVaultBackupMetadata<T>>;
  restore(backupId: string, vault: IVault): Promise<ISynchronizerData>;
}
