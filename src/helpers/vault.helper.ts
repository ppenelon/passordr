import { IVault, IVaultService } from "../types/vault.type";
import { uuidv4 } from "./uuid.helper";

export function generateNewVault(): IVault {
  return {
    clientId: uuidv4(),
    encryptedData:
      "KJuDtQPxUzqFXnhcnjfecPrbm5q5xpfP9up6zwQCCjn/tzFGAxMOdSEv7GHfFEQTN47l5Hu6S1UIDNGRbiL4k34mc2Rx819gbGeAYKeg5w0w97DFqmT6w7J7JfNX4aDrrBQkiSUO0W0Pz9IkV2VICMBkIVzL4wdFi8Zj1U+NCktkREw0O4aYcYWcqfRZcNaJhv9n0xwUf0nQi/JkCMmFIWsQLw==",
    name: "New vault",
    password: false,
    // These are the default encrypted data with "passordr" password (has to be default password when no password selected)
    // hint: "Enter your hint here, be creative!",
    // services: [{ name: "Welcome to passordr", outdated: false }],
    // history: [],
  };
}

export function generateNewService(): IVaultService {
  return {
    name: "",
    outdated: false,
  };
}
