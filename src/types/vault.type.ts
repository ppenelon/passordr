export interface IVault {
  clientId: string;
  name: string;
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
