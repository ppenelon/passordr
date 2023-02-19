import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateNewVault } from "../helpers/vault.helper";
import { IVault } from "../types/vault.type";

const defaultVault = generateNewVault();

export interface IVaultsManagerStore {
  storedVaults: IVault[];
  currentVaultClientId: IVault["clientId"];

  storeNewVault: (
    vault: IVault,
    options?: { insertAndSelect?: boolean }
  ) => void;
  changeCurrentVault: (vaultClientId: string) => void;
  renameVault: (vaultClientId: string, name: string) => void;
  deleteVault: (vaultClientId: string) => void;

  updateCurrentVault: (
    updateVault: (
      currentVaultState: IVault
    ) => Partial<Omit<IVault, "clientId">>
  ) => void;
}

export const useVaultsManagerStore = create(
  persist<IVaultsManagerStore>(
    (set) => ({
      storedVaults: [defaultVault],
      currentVaultClientId: defaultVault.clientId,

      storeNewVault: (vault, options = {}) =>
        set((state) => {
          const storeUpdate: Partial<IVaultsManagerStore> = {
            storedVaults: [...state.storedVaults, vault],
          };

          if (options.insertAndSelect) {
            storeUpdate.currentVaultClientId = vault.clientId;
          }

          return storeUpdate;
        }),
      changeCurrentVault: (vaultClientId) =>
        set((state) => ({ currentVaultClientId: vaultClientId })),
      renameVault: (vaultClientId, name) =>
        set((state) => ({
          storedVaults: state.storedVaults.map((vault) =>
            vault.clientId === vaultClientId ? { ...vault, name } : vault
          ),
        })),
      deleteVault: (vaultClientId) =>
        set((state) => ({
          storedVaults: state.storedVaults.filter(
            (vault) => vault.clientId !== vaultClientId
          ),
          currentVaultClientId:
            state.currentVaultClientId === vaultClientId
              ? state.storedVaults[0].clientId
              : state.currentVaultClientId,
        })),

      updateCurrentVault: (
        updateVault: (
          currentVaultState: IVault
        ) => Partial<Omit<IVault, "clientId">>
      ) =>
        set((state) => {
          return {
            storedVaults: state.storedVaults.map((vault) =>
              vault.clientId === state.currentVaultClientId
                ? { ...vault, ...updateVault(vault) }
                : vault
            ),
          };
        }),
    }),
    {
      name: "passordrVaults",
      version: 1,
    }
  )
);

export function useCurrentVault(): IVault {
  return useVaultsManagerStore((state) =>
    state.storedVaults.find(
      (vault) => vault.clientId === state.currentVaultClientId
    )
  ) as IVault;
}
