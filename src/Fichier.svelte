<script>
  import { createEventDispatcher } from "svelte";
  import { presse_papier } from "./utils";
  export let id;
  export let nom;
  export let mimeType;
  export let webContentLink;
  export let trashed;

  // Creation d'un EventDispatcher qui permet l'envoi d'evenement personnalises traité par le composant parent et qui fonction d'une maniere similaire au evenement HTML standard comme les evenement clic et defilement, etc...
  const dispatch = createEventDispatcher();

  // Gere l'envoi de l'evenement personnalise au composant parent quand l'utilisateur clic sur le nom d'un fichier ou dossier contenant le id, nom et type du fichier ou dossier
  function envoyerInfoFichier() {
    dispatch("message", {
      type: "CLIC_NOM",
      id: id,
      nom: nom,
      mimeType: mimeType,
    });
  }

  // Gere l'envoi d'un fichier ou dossier a la poubelle et puis envoi un evenement personnalise au composent parent pour l'actualisation de la vue des fichiers drive courante
  function gererEnvoiPoubelle() {
    gapi.client.drive.files
      .update({
        fileId: id,
        trashed: true,
      })
      .then(function (reponse) {
        console.log(reponse);
        dispatch("message", {
          type: "FICHIER_POUBELLE",
        });
      });
  }

  // Gere la suppresion definitive d'un fichier ou dossier et puis envoi un evenement personnalise au composent parent pour l'actualisation de la vue des fichiers drive courante
  function gererSuppression() {
    gapi.client.drive.files
      .delete({
        fileId: id,
      })
      .then(function (reponse) {
        console.log(reponse);
        dispatch("message", {
          type: "FICHIER_SUPPRIME",
        });
      });
  }

  // Gere le telechargement de fichier en utilisant un element lien cache cree puis detruit apres utilisation
  function gererTelechargement() {
    let elementTomp = document.createElement("a");
    elementTomp.setAttribute("href", webContentLink);
    elementTomp.style.display = "none";
    document.body.appendChild(elementTomp);
    elementTomp.click();
    document.body.removeChild(elementTomp);
  }

  // Gere le clic sur le bouton de copie en enregistrant l'id du fichier dans le presse-papier
  function gererCopie() {
    presse_papier.set(id);
  }
</script>

<div class="conteneur">
  <div class="contenu">
    <!-- Affichage conditionnel de l'icon -->
    {#if mimeType == "application/vnd.google-apps.folder"}
      <div class="icon">&#128193</div>
    {:else}
      <div class="icon">&#128196</div>
    {/if}
    <div class="nom" on:click={envoyerInfoFichier}>{nom}</div>
    {#if trashed}
      <svg
        version="1.1"
        id="Capa_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 384 384"
        style="enable-background:new 0 0 384 384;"
        xml:space="preserve">
        <g>
          <g>
            <g>
              <path
                d="M64,341.333C64,364.907,83.093,384,106.667,384h170.667C300.907,384,320,364.907,320,341.333v-256H64V341.333z"
              />
              <polygon
                points="266.667,21.333 245.333,0 138.667,0 117.333,21.333 42.667,21.333 42.667,64 341.333,64 341.333,21.333 			"
              />
            </g>
          </g>
        </g>
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
        <g />
      </svg>
    {/if}
  </div>
  <div>
    <!-- Affiche les boutons copie et telechargement seulement pour les fichiers -->
    {#if mimeType != "application/vnd.google-apps.folder"}
      <button on:click={gererCopie}>Copier</button>
      <button on:click={gererTelechargement}>Telecharger</button>
    {/if}
    <button on:click={gererSuppression}>Supprimer</button>
    <button on:click={gererEnvoiPoubelle}>Jeter</button>
  </div>
</div>

<style>
  .conteneur {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: gainsboro;
    padding: 5px;
    margin-bottom: 8px;
  }

  .contenu {
    display: flex;
  }

  .icon {
    margin-right: 5px;
  }

  .nom {
    cursor: pointer;
  }

  svg {
    height: 20px;
    margin-left: 5px;
    fill: rgba(255, 0, 0, 0.7);
  }

  button {
    margin: 0;
    cursor: pointer;
  }
</style>
