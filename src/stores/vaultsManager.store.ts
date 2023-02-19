import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateNewVault } from "../helpers/vault.helper";
import { IVault, IVaultHistoryItem, IVaultService } from "../types/vault.type";

export interface IVaultsManagerStore {
  storedVaults: IVault[];
  currentVaultClientId: IVault["clientId"];

  storeNewVault: (
    vault: IVault,
    options?: { insertAndSelect?: boolean }
  ) => void;
  changeVault: (vaultClientId: string) => void;

  renameCurrentVault: (name: string) => void;
  setCurrentVaultHint: (hint: string) => void;
  setCurrentVaultServices: (services: IVaultService[]) => void;
  addHistoryItemToCurrentVault: (newHistoryItem: IVaultHistoryItem) => void;
}

export const useVaultsManagerStore = create(
  persist<IVaultsManagerStore>(
    (set) => {
      const defaultVault = generateNewVault();

      function updateCurrentVault(
        updateVault: (
          currentVaultState: IVault
        ) => Partial<Omit<IVault, "clientId">>
      ) {
        set((state) => {
          return {
            storedVaults: state.storedVaults.map((vault) =>
              vault.clientId === state.currentVaultClientId
                ? Object.assign(vault, updateVault(vault))
                : vault
            ),
          };
        });
      }

      return {
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
        changeVault: (vaultClientId) =>
          set((state) => ({ currentVaultClientId: vaultClientId })),

        renameCurrentVault: (name) => updateCurrentVault((vault) => ({ name })),
        setCurrentVaultHint: (hint) =>
          updateCurrentVault((vault) => ({ hint })),
        setCurrentVaultServices: (services) =>
          updateCurrentVault((vault) => ({ services })),
        addHistoryItemToCurrentVault: (newHistoryItem) =>
          updateCurrentVault((vault) => ({
            history: [...vault.history, newHistoryItem],
          })),
      };
    },
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
