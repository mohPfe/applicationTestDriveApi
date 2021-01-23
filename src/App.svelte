<script>
  import VueDrive from "./VueDrive.svelte";
  import VueUi from "./VueUi.svelte";
  import { donnees } from "./utils";

  // variables qui controlent l'affichages des differents vues
  let afficherAuthentification = true;
  let afficherVueDrive = false;
  let afficherVueUI = false;

  // fonction qui retourne les parametres passé par l'url
  function getParamsUrl() {
    const queryString = window.location.search;
    const paramsUrl = new URLSearchParams(queryString);
    return paramsUrl;
  }

  // fonction qui convertie les paramatres passé par l'url à un objet Javascript
  function paramsUrlEnObjet(paramsUrl) {
    if (paramsUrl.has("state")) {
      return JSON.parse(Object.fromEntries(paramsUrl.entries()).state);
    } else {
      return {};
    }
  }

  // gere les parametres passé par l'url
  function gererParamsUrl() {
    const paramsUrl = getParamsUrl();
    // voir le type de parametre Google Drive UI passé par l'url pour afficher la vue correspondante
    if (paramsUrl.has("state")) {
      const paramsObj = paramsUrlEnObjet(paramsUrl);
      if (paramsObj.action == "create" || paramsObj.action == "open") {
        afficherVueUI = true;
      }
    }
  }

  // appel de la fonction gerant les parametres url
  gererParamsUrl();

  // Appelé quand le client google API est chargée
  function handleClientLoad() {
    gapi.load("client:auth2", initClient);
  }

  // initialise le client avec les informations de l'utilisateur de l'API et prepare l'authentification
  function initClient() {
    gapi.client
      .init({
        apiKey: donnees.API_KEY,
        clientId: donnees.CLIENT_ID,
        discoveryDocs: donnees.DISCOVERY_DOCS,
        scope: donnees.SCOPES,
      })
      .then(
        function () {
          gapi.auth2.getAuthInstance().isSignedIn.listen(majEtatConnexion);

          majEtatConnexion(gapi.auth2.getAuthInstance().isSignedIn.get());
        },
        function (error) {
          console.log(JSON.stringify(error, null, 2));
        }
      );
  }

  // Gere le changement de l'affichage des boutons d'authentification et deconnexion ansi que l'affichage de la vue des fichiers drive
  function majEtatConnexion(estConnecte) {
    if (estConnecte) {
      afficherAuthentification = false;
      afficherVueDrive = true;
    } else {
      afficherAuthentification = true;
      afficherVueDrive = false;
    }
  }

  // Gere le clic sur le bouton authentification
  function authentification(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  // Gere le clic sur le bouton deconnexion
  function deconnexion(event) {
    gapi.auth2.getAuthInstance().signOut();
  }
</script>

<svelte:head
  ><script
    defer
    async
    src="https://apis.google.com/js/api.js"
    on:load={handleClientLoad}>
  </script></svelte:head
>

<main>
  <div class="zoneConnexion">
    <h1>Application test de Google Drive</h1>
    <!-- Affichage conditionnel des boutons d'authentification -->
    {#if !afficherAuthentification}
      <button on:click={deconnexion}>Déconnexion</button>
    {:else}
      <button on:click={authentification}>Authentification</button>
    {/if}
  </div>
  <!-- Affichage conditionnel de la vue des fichiers drive -->
  {#if afficherVueDrive}
    {#if afficherVueUI}
      <VueUi prop={paramsUrlEnObjet(getParamsUrl())} />
    {:else}
      <VueDrive />
    {/if}
  {/if}
</main>

<style>
  main {
    width: 50vw;
    margin: auto;
  }
  .zoneConnexion {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  button {
    height: 50px;
  }
</style>
