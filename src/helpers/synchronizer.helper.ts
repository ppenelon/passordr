import { ISynchronizerData } from "../types/synchronizer.type";
import { IVault } from "../types/vault.type";

export function extractSynchronizerDataFromVault(
  vault: IVault
): ISynchronizerData {
  return {
    password: vault.password,
    encryptedData: vault.encryptedData,
  };
}
