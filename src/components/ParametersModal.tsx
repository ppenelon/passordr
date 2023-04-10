import React from "react";
import { ModalType, useInteractionsStore } from "../stores/interactions.store";
import Modal from "./Modal";
import "./HistoryModal.css";
import "./ParametersModal.css";

const ParametersModal: React.FC = () => {
  const openedModal = useInteractionsStore((state) => state.openedModal);
  const closeModal = useInteractionsStore((state) => state.closeModal);

  return (
    <Modal
      title={`Parameters`}
      className="parameters-modal"
      opened={openedModal === ModalType.Parameters}
      onClose={() => closeModal()}
    >
      I am empty (for the moment)
    </Modal>
  );
};

export default ParametersModal;
