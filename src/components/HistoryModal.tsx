import React, { useMemo } from "react";
import { ModalType, useInteractionsStore } from "../stores/interactions.store";
import Modal from "./Modal";
import {
  IVaultHistoryItem,
  IVaultHistoryItemUpdate,
  VaultHistoryItemUpdateType,
} from "../types/vault.type";
import "./HistoryModal.css";
import { useVaultsManagerStore } from "../stores/vaultsManager.store";

interface IFormattedVaultHistoryItem extends IVaultHistoryItem {
  formattedTimestamp: string;
  totalsUpdateTypes: { [key in VaultHistoryItemUpdateType]?: number };
  updatesWithHint: IVaultHistoryItemUpdate[];
}

const HistoryModal: React.FC = () => {
  const openedModal = useInteractionsStore((state) => state.openedModal);
  const closeModal = useInteractionsStore((state) => state.closeModal);

  const openedVaultData = useVaultsManagerStore((state) => state.vaultData);
  const storedHistory = useMemo(
    () => (openedVaultData ? openedVaultData.history : []),
    [openedVaultData]
  );

  // Compute reversed history with additionnal properties
  // Used to cache data and compute only when needed
  const reversedVaultHistory = useMemo<IFormattedVaultHistoryItem[]>(() => {
    const reversedHistory = storedHistory.slice().reverse();
    const formattedHistory: IFormattedVaultHistoryItem[] = [];

    for (const historyItem of reversedHistory) {
      const formattedTimestamp = new Date(
        historyItem.timestamp
      ).toLocaleString();

      const totalsUpdateTypes: IFormattedVaultHistoryItem["totalsUpdateTypes"] =
        {};
      for (const type of Object.values(VaultHistoryItemUpdateType)) {
        if (type === VaultHistoryItemUpdateType.Hint) {
          totalsUpdateTypes[type] = historyItem.hint ? 1 : 0;
        } else {
          totalsUpdateTypes[type] = historyItem.updates.reduce(
            (total, update) => (update.type === type ? total + 1 : total),
            0
          );
        }
      }

      const updatesWithHint = [...historyItem.updates];
      if (historyItem.hint) {
        updatesWithHint.unshift({
          serviceIndex: 0,
          type: VaultHistoryItemUpdateType.Hint,
          serviceNameFrom: historyItem.hint.hintFrom,
          serviceNameTo: historyItem.hint.hintTo,
        });
      }

      formattedHistory.push({
        ...historyItem,
        formattedTimestamp,
        totalsUpdateTypes,
        updatesWithHint,
      });
    }

    return formattedHistory;
  }, [storedHistory]);

  return (
    <Modal
      title={`Vault history (${storedHistory.length} update${
        storedHistory.length > 1 ? "s" : ""
      })`}
      className="history-modal"
      opened={openedModal === ModalType.History}
      onClose={() => closeModal()}
    >
      <ul className="vault-history">
        {reversedVaultHistory.map((historyItem) => (
          <li className="vault-history-item" key={historyItem.timestamp}>
            <h3>
              <span>{historyItem.formattedTimestamp}</span>
              <span>
                {Object.entries(historyItem.totalsUpdateTypes).map(
                  ([type, totalUpdates]) => (
                    <span data-vault-history-item-update-type={type} key={type}>
                      {totalUpdates}
                    </span>
                  )
                )}
              </span>
            </h3>
            <ul>
              {historyItem.updatesWithHint.map((historyItemUpdate, index) => (
                <li className="vault-history-item-update" key={index}>
                  <span
                    data-vault-history-item-update-type={historyItemUpdate.type}
                  >
                    {historyItemUpdate.type}
                  </span>
                  <table className="vault-history-item-update-values">
                    <tbody>
                      <tr>
                        <td colSpan={2}>
                          {historyItemUpdate.type ===
                          VaultHistoryItemUpdateType.Hint
                            ? `Hint`
                            : `Service N°${historyItemUpdate.serviceIndex}`}
                        </td>
                      </tr>
                      <tr>
                        <td>Previous value</td>
                        <td>
                          <code>{historyItemUpdate.serviceNameFrom}</code>
                        </td>
                      </tr>
                      <tr>
                        <td>New value</td>
                        <td>
                          <code>{historyItemUpdate.serviceNameTo}</code>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Modal>
  );
};

export default HistoryModal;
