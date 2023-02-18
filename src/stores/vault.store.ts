import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface IVaultStore {
  name: string;
  hint: string;
  services: IVaultService[];
  history: IVaultHistoryItem[];

  rename: (name: string) => void;
  setHint: (hint: string) => void;
  setServices: (services: IVaultService[]) => void;
  addHistoryItem: (newHistoryItem: IVaultHistoryItem) => void;
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
  }
  
  updates: IVaultHistoryItemUpdate[];
}

export interface IVaultHistoryItemUpdate {
  serviceIndex: number;
  type: VaultHistoryItemUpdateType;
  serviceNameFrom: string;
  serviceNameTo: string;
}

export enum VaultHistoryItemUpdateType {
  Hint = 'hint',
  Added = 'added',
  Update = 'update',
  Outdate = 'outdate',
}

export const useVaultStore = create(
  persist<IVaultStore>((set) => ({
    name: "New vault",
    hint: "Enter your hint here, be creative!",
    services: [{ name: "Welcome to passordr", outdated: false }],
    history: [],
    rename: (name: string) => set((state) => ({ name })),
    setHint: (hint: string) => set((state) => ({ hint })),
    setServices: (services: IVaultService[]) => set((state) => ({ services })),
    addHistoryItem: (newHistoryItem: IVaultHistoryItem) => set((state) => ({ history: [...state.history, newHistoryItem] }))
  }), {
    name: 'vault',
    version: 1
  })
);

export function generateNewService(): IVaultService {
  return {
    name: '',
    outdated: false
  };
}