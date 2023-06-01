import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateNewVault } from "../helpers/vault.helper";
import { IVault, IVaultData } from "../types/vault.type";
import { decryptData, encryptData } from "../helpers/aes.helper";
import { ISynchronizerData } from "../types/synchronizer.type";

const defaultVault = generateNewVault();
const defaultPassword = "passordr";

export const PasswordExpiredException = new Error("Password has expired");
export const BadPasswordException = new Error("Incorrect password");

export interface IVaultsManagerStore {
  storedVaults: IVault[];
  currentVaultClientId: IVault["clientId"];

  vaultData?: IVaultData;

  password?: string;
  passwordTimeout?: number;
  passwordValidity?: number;

  storeNewVault: (
    vault: IVault,
    options?: { insertAndSelect?: boolean }
  ) => void;
  changeCurrentVault: (vaultClientId: string) => void;
  renameVault: (vaultClientId: string, name: string) => void;
  deleteVault: (vaultClientId: string) => void;

  openVault: (vault: ISynchronizerData, password: string) => Promise<void>;
  keepVaultOpen: () => void;
  setPasswordValidity: (validity: number) => void;
  updateVaultPassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<void>;
  closeVault: () => void;

  saveCurrentVaultData: (vaultData: IVaultData) => Promise<void>;
  updateCurrentVault: (
    updateVault: (
      currentVaultState: IVault
    ) => Partial<Omit<IVault, "clientId">>
  ) => void;
}

export const useVaultsManagerStore = create<IVaultsManagerStore>()(
  persist(
    (set, get) => ({
      storedVaults: [defaultVault],
      currentVaultClientId: defaultVault.clientId,

      vaultData: undefined,
      vaultPassword: undefined,

      passwordTimeout: undefined,
      passwordValidity: undefined,

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

      async openVault(vault, password) {
        const storedPassword = vault.password ? password : defaultPassword;
        if (!storedPassword) throw PasswordExpiredException;

        const decryptedData = await decryptData(
          vault.encryptedData,
          storedPassword
        );
        if (!decryptedData) throw BadPasswordException;

        const vaultData = JSON.parse(decryptedData);
        set({ vaultData, password });
        get().keepVaultOpen();
      },
      keepVaultOpen() {
        const state = get();
        clearTimeout(state.passwordTimeout);
        if (state.passwordValidity) {
          set({
            passwordTimeout: setTimeout(() => {
              get().closeVault();
            }, state.passwordValidity),
          });
        }
      },
      setPasswordValidity(validity) {
        set({ passwordValidity: validity });
      },
      async updateVaultPassword(oldPassword, newPassword) {
        const currentVault = get().storedVaults.find(
          (vault) => vault.clientId === get().currentVaultClientId
        );

        const decryptedData = await decryptData(
          currentVault!.encryptedData,
          currentVault!.password ? oldPassword : defaultPassword
        );
        if (!decryptedData) throw BadPasswordException;

        const stillUsePassword = !!newPassword;
        const encryptedData = await encryptData(
          decryptedData,
          stillUsePassword ? newPassword : defaultPassword
        );

        get().updateCurrentVault(() => ({
          password: stillUsePassword,
          encryptedData: encryptedData,
        }));
        set({ password: newPassword });
      },
      closeVault() {
        clearTimeout(get().passwordTimeout);
        set({ passwordTimeout: undefined });

        const currentVault = get().storedVaults.find(
          (vault) => vault.clientId === get().currentVaultClientId
        );

        if (currentVault!.password) {
          set({
            vaultData: undefined,
            password: undefined,
          });
        }
      },

      async saveCurrentVaultData(vaultData) {
        const currentVault = get().storedVaults.find(
          (vault) => vault.clientId === get().currentVaultClientId
        );

        const storedPassword = currentVault!.password
          ? get().password
          : defaultPassword;
        if (!storedPassword) throw PasswordExpiredException;

        const encryptedData = await encryptData(
          JSON.stringify(vaultData),
          storedPassword
        );

        set({ vaultData });
        get().updateCurrentVault((vault) => ({ encryptedData: encryptedData }));
      },
      updateCurrentVault: (
        updateVault: (
          currentVaultState: IVault
        ) => Partial<Omit<IVault, "clientId">>
      ) =>
        set((state) => {
          return {
            storedVaults: state.storedVaults.map((vault) =>
              vault.clientId === state.currentVaultClientId
                ? {
                    ...vault,
                    ...updateVault(vault),
                    lastUpdate: new Date().toISOString(),
                  }
                : vault
            ),
          };
        }),
    }),
    {
      name: "passordrVaults",
      version: 1,
      partialize: ({
        storedVaults,
        currentVaultClientId,
        passwordValidity,
      }) => ({
        storedVaults,
        currentVaultClientId,
        passwordValidity,
      }),
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
