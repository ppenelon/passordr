import { create } from "zustand";

export enum ModalType {
  History = "history",
  ChangeVault = "change-vault",
}

export interface IInteractionsStore {
  sidebarOpened: boolean;
  openedModal: ModalType | null;

  openSidebar: () => void;
  closeSidebar: () => void;
  openModal: (modalType: ModalType) => void;
  closeModal: () => void;
}

export const useInteractionsStore = create<IInteractionsStore>((set) => ({
  sidebarOpened: false,
  openedModal: null,
  openSidebar: () => set({ sidebarOpened: true }),
  closeSidebar: () => set({ sidebarOpened: false }),
  openModal: (modalType: ModalType) => set({ openedModal: modalType }),
  closeModal: () => set({ openedModal: null }),
}));
