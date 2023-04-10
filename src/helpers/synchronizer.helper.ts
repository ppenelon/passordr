import { ISynchronizerData } from "../types/synchronizer.type";
import { IVault } from "../types/vault.type";

export function extractSynchronizerDataFromVault(
  vault: IVault
): ISynchronizerData {
  return {
    hint: vault.hint,
    services: vault.services,
    history: vault.history,
  };
}
