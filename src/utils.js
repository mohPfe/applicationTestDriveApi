import { writable } from "svelte/store";

// Donnees necessaires pour l'API
export const donnees = {
  API_KEY: "API_KEY",
  CLIENT_ID: "CLIENT_ID",
  DISCOVERY_DOCS: [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
  ],
  SCOPES:
    "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.install",
};

// Creation d'un "store" du framework Svelte qui permet l'acces et la modification de sa valeur n'importe ou dans l'application, celui-ci est pour le presse-papier utilise pour la copie, est initialise avec une chaine de caracteres vide
export const presse_papier = writable("");
