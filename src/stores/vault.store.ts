import { create } from 'zustand'

export interface IVaultStore {
  name: string;
  hint: string;
  services: IVaultService[];

  rename: (name: string) => void;
  setHint: (hint: string) => void;
  setServices: (services: IVaultService[]) => void;
}

export interface IVaultService {
  name: string;
  outdated: boolean;
}

export const useVaultStore = create<IVaultStore>((set) => ({
  name: "New vault",
  hint: "Hello\nBoys",
  services: Array(100).fill({ name: "My Service", outdated: false }).map((line, index) => ({ ...line, name: line.name + index, outdated: Math.random() > 0.9 })),
  rename: (name: string) => set((state) => ({ name })),
  setHint: (hint: string) => set((state) => ({ hint })),
  setServices: (services: IVaultService[]) => set((state) => ({ services }))
}));

export function generateNewService(): IVaultService {
  return {
    name: '',
    outdated: false
  };
}