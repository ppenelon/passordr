import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export const useVaultStore = create(
  persist<IVaultStore>((set) => ({
    name: "New vault",
    hint: "Enter your hint here, be creative!",
    services: [{ name: "Welcome to passordr", outdated: false }],
    rename: (name: string) => set((state) => ({ name })),
    setHint: (hint: string) => set((state) => ({ hint })),
    setServices: (services: IVaultService[]) => set((state) => ({ services }))
  }), {
    name: 'vault'
  })
);

export function generateNewService(): IVaultService {
  return {
    name: '',
    outdated: false
  };
}