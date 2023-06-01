import { useState, useRef, useEffect } from "react";
import "./VaultLock.css";
import {
  useCurrentVault,
  useVaultsManagerStore,
} from "../stores/vaultsManager.store";
import { useInteractionsStore } from "../stores/interactions.store";
import classNames from "classnames";

const VaultLock = () => {
  const currentVault = useCurrentVault();
  const openVault = useVaultsManagerStore((state) => state.openVault);

  const setAppLoading = useInteractionsStore((state) => state.setAppLoading);
  const setAppLoaded = useInteractionsStore((state) => state.setAppLoaded);

  const [formErrored, setFormErrored] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formErrored) {
      setTimeout(() => setFormErrored(false), 500);
    }
  }, [formErrored]);

  async function unlockVault(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!passwordInputRef.current || !passwordInputRef.current.value) return;

    setAppLoading();
    try {
      await openVault(currentVault, passwordInputRef.current.value || "");
    } catch (error) {
      setFormErrored(true);
      console.error(error);
    }
    setAppLoaded();
  }

  return (
    <div className="vault-lock">
      <form
        className={classNames("vault-lock-form", { errored: formErrored })}
        onSubmit={(e) => unlockVault(e)}
      >
        <input
          type="password"
          ref={passwordInputRef}
          placeholder="Vault is password-protected"
        />
        <button className="action-button" type="submit">
          {/* Font Awesome fa-solid fa-key */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default VaultLock;
