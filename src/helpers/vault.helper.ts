import { IVault, IVaultService } from "../types/vault.type";
import { uuidv4 } from "./uuid.helper";

export function generateNewVault(): IVault {
  return {
    clientId: uuidv4(),
    name: "New vault",
    hint: "Enter your hint here, be creative!",
    services: [{ name: "Welcome to passordr", outdated: false }],
    history: [],
  };
}

export function generateNewService(): IVaultService {
  return {
    name: "",
    outdated: false,
  };
}
