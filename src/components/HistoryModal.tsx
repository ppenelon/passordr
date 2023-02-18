import React, { useMemo } from "react";
import { ModalType, useInteractionsStore } from "../stores/interactions.store";
import { IVaultHistoryItem, useVaultStore } from "../stores/vault.store";
import Modal from "./Modal";
import './HistoryModal.css';

interface IFormattedVaultHistoryItem extends IVaultHistoryItem {
  formattedTimestamp: string;
} 

const HistoryModal: React.FC = () => {
  const openedModal = useInteractionsStore(state => state.openedModal);
  const closeModal = useInteractionsStore(state => state.closeModal);

  const vaultHistory = useVaultStore(state => state.history);

  const reversedVaultHistory = useMemo<IFormattedVaultHistoryItem[]>(() => 
    vaultHistory
      .slice()
      .reverse()
      .map(historyItem => ({
        ...historyItem,
        formattedTimestamp: new Date(historyItem.timestamp).toLocaleString()
      }))
    , [vaultHistory]);

  return (
    <Modal title="Vault history" className="history-modal" opened={openedModal === ModalType.History} onClose={() => closeModal()}>
      <ul className="vault-history">
        {reversedVaultHistory.map(historyItem => 
          <li className="vault-history-item">
            <h3>{historyItem.formattedTimestamp}</h3>
            <ul>
              {historyItem.updates.map(historyItemUpdate =>
                <li className="vault-history-item-update">
                  <span data-vault-history-item-update-type={historyItemUpdate.type}>{historyItemUpdate.type}</span>
                  <table className="vault-history-item-update-values">
                    <tbody>
                      <tr>
                        <td colSpan={2}>Service N°{historyItemUpdate.serviceIndex}</td>
                      </tr>
                      <tr>
                        <td>Previous name</td>
                        <td><code>{historyItemUpdate.serviceNameFrom}</code></td>
                      </tr>
                      <tr>
                        <td>New name</td>
                        <td><code>{historyItemUpdate.serviceNameTo}</code></td>
                      </tr>
                    </tbody>
                  </table>
                </li>
              )}
            </ul>
          </li>
        )}
      </ul>
    </Modal>
  );
}

export default HistoryModal;