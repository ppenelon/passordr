import { extractSynchronizerDataFromVault } from "../helpers/synchronizer.helper";
import { ISynchronizer, SynchronizerType } from "../types/synchronizer.type";
import { IVault } from "../types/vault.type";

export interface ILocalFileSynchronizerOptions {}

export class LocalFileSynchronizer
  implements ISynchronizer<SynchronizerType.LocalFile>
{
  async backup(vault: IVault) {
    const content = encodeURIComponent(
      JSON.stringify(extractSynchronizerDataFromVault(vault))
    );

    const element = document.createElement("a");
    element.href = `data:text/plain;charset=utf-8,${content}`;
    element.download = `${vault.clientId}.json`;

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

    return {
      lastBackupDate: new Date().toISOString(),
    };
  }

  async restore(backupId: string, vault: IVault) {
    const element = document.createElement("input");
    element.type = "file";
    element.accept = "application/json";

    element.style.display = "none";
    document.body.appendChild(element);

    const content = await new Promise<string>((resolve, reject) => {
      element.addEventListener("change", () => {
        if (!element.files?.length) return reject(new Error("Canceled"));

        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(reader.result as string));

        reader.readAsText(element.files[0]);
      });

      element.click();
      document.body.removeChild(element);
    });

    const vaultRestoredData = JSON.parse(content);
    if (
      !vaultRestoredData.hasOwnProperty("password") ||
      !vaultRestoredData.hasOwnProperty("encryptedData")
    ) {
      throw new Error("Bad restoration file");
    }

    return vaultRestoredData;
  }
}
