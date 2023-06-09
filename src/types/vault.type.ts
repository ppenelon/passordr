export interface IVault {
  clientId: string;

  name: string;
  encryptedData: string;

  password: boolean;

  lastUpdate?: string;

  localFileSynchronizer?: IVaultLocalFileBackup;
  googleDriveSynchronizer?: IVaultGoogleDriveBackup;
}

export interface IVaultData {
  hint: string;
  services: IVaultService[];
  history: IVaultHistoryItem[];
}

export interface IVaultService {
  name: string;
  outdated: boolean;
}

export interface IVaultHistoryItem {
  timestamp: string;

  hint?: {
    hintFrom: string;
    hintTo: string;
  };

  updates: IVaultHistoryItemUpdate[];
}

export interface IVaultHistoryItemUpdate {
  serviceIndex: number;
  type: VaultHistoryItemUpdateType;
  serviceNameFrom: string;
  serviceNameTo: string;
}

export enum VaultHistoryItemUpdateType {
  Hint = "hint",
  Added = "added",
  Update = "update",
  Outdate = "outdate",
}

export interface IVaultLocalFileBackup {
  lastBackupDate: string;
}
export interface IVaultGoogleDriveBackup {
  lastBackupDate: string;
}
