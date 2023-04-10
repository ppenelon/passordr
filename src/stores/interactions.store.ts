import { create } from "zustand";

export enum ModalType {
  History = "history",
  ChangeVault = "change-vault",
  Backup = "backup",
  Parameters = "parameters",
}

export interface IInteractionsStore {
  sidebarOpened: boolean;
  openedModal: ModalType | null;
  isAppLoading: boolean;

  openSidebar: () => void;
  closeSidebar: () => void;
  openModal: (modalType: ModalType) => void;
  closeModal: () => void;
  setAppLoading: () => void;
  setAppLoaded: () => void;
}

export const useInteractionsStore = create<IInteractionsStore>((set) => ({
  sidebarOpened: false,
  openedModal: null,
  isAppLoading: false,
  openSidebar: () => set({ sidebarOpened: true }),
  closeSidebar: () => set({ sidebarOpened: false }),
  openModal: (modalType: ModalType) => set({ openedModal: modalType }),
  closeModal: () => set({ openedModal: null }),
  setAppLoading: () => set({ isAppLoading: true }),
  setAppLoaded: () => set({ isAppLoading: false }),
}));
