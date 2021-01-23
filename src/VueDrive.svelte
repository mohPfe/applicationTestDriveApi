<script>
  import Fichier from "./Fichier.svelte";
  import BarreProg from "./BarreProg.svelte";
  import { presse_papier } from "./utils";

  let afficherBarreProg = false;

  let infoVue = {
    cheminCourantIds: ["root"],
    cheminCourantNoms: ["/"],
    cheminCourantString: "/",
    longeurChemin: 1,
  };

  // Changement de l'etat du bouton de retour en fonction de l'emplacement de l'utilisateur
  $: {
    const boutonRetour = document.getElementById("btnRetour");
    if (boutonRetour)
      infoVue.longeurChemin == 1
        ? (boutonRetour.disabled = true)
        : (boutonRetour.disabled = false);
  }

  // Changement de l'etat du bouton de colle en fonction de l'etat du presse-papier
  $: {
    const boutonColle = document.getElementById("btnColle");
    if (boutonColle)
      $presse_papier == ""
        ? (boutonColle.disabled = true)
        : (boutonColle.disabled = false);
  }

  let fichiersDrive;

  // Recuperation des fichiers et dossiers presents dans l'emplacement courant
  function listFichiers() {
    gapi.client.drive.files
      .list({
        q: `'${
          infoVue.cheminCourantIds[infoVue.cheminCourantIds.length - 1]
        }' in parents`,
        pageSize: 10,
        fields:
          "nextPageToken, files(id, name, mimeType, parents, webViewLink, webContentLink, trashed)",
      })
      .then(function (reponse) {
        const fichiers = reponse.result.files;
        console.log(fichiers);
        fichiersDrive = fichiers;
        infoVue.longeurChemin = infoVue.cheminCourantIds.length;
        infoVue.cheminCourantString = creerCheminCourantTexte();
        if (fichiers) {
          console.log(infoVue);
        }
      });
  }

  // Appel initial de la fonction
  listFichiers();

  // Creation du chemin courant en forme de texte pour l'affichage
  function creerCheminCourantTexte() {
    let cheminCourantTexte = "/";
    for (let i = 1; i < infoVue.cheminCourantNoms.length; i++) {
      cheminCourantTexte =
        cheminCourantTexte + infoVue.cheminCourantNoms[i] + "/";
    }
    return cheminCourantTexte;
  }

  // Gere les message recus par les composants Fichiers, comme le clic sur un nom de fichier ou dossier, la suppresion et l'envoi a la poubelle
  function gererMessageFichier(event) {
    const typeMessage = event.detail.type;
    const id = event.detail.id;
    const nom = event.detail.nom;
    const mimeType = event.detail.mimeType;
    console.log(event);
    if (typeMessage == "CLIC_NOM") {
      if (mimeType == "application/vnd.google-apps.folder") {
        infoVue.cheminCourantIds.push(id);
        infoVue.cheminCourantNoms.push(nom);
        listFichiers();
      }
    } else listFichiers();
  }

  // Gere les clic sur le bouton retour et met a jours le chemin courant et actualise la vue drive actuelle
  function gererClicRetour() {
    infoVue.cheminCourantIds.pop();
    infoVue.cheminCourantNoms.pop();
    listFichiers();
  }

  // Gere les clic sur le bouton ajout de fichier en invoquant l'evenemtn clic sur l'element input de selection de fichier cachée
  function gererClicAjoutFichier() {
    const elementFichier = document.getElementById("inputFichier");
    elementFichier.click();
  }

  // Gere la colle de fichier en envoyant l'id du fichier dans le presse papier a google drive vers le dossier courant et puis actualise la vue actuelle
  function gererColle() {
    gapi.client.drive.files
      .get({
        fileId: $presse_papier,
        fields: "parents",
      })
      .then(function (file) {
        gapi.client.drive.files
          .update({
            fileId: $presse_papier,
            addParents:
              infoVue.cheminCourantIds[infoVue.cheminCourantIds.length - 1],
            fields: "id, parents",
          })
          .then(function (response) {
            listFichiers();
          });
      });
  }

  // Gere l'upload de fichier en lisant le fichier de l'input de selection de fichier avec un FileReader, apres la fin de lecture le resultat est envoyer a google drive a l'emplacement courant par un upload de type "resumable" qui permet l'upload de fichier plus grand que 5MB et puis actualise la vue actuelle
  function gererUploadFichier() {
    afficherBarreProg = true;
    const fichierUpload = this.files[0];
    const reader = new FileReader();
    reader.onload = function () {
      const bodyResultat = btoa(reader.result);
      const tailleResultat = bodyResultat.length * (3 / 4) - 2;
      const bodyRequetinitiale = {
        name: fichierUpload.name,
        parents: [
          infoVue.cheminCourantIds[infoVue.cheminCourantIds.length - 1],
        ],
      };
      gapi.client
        .request({
          path: "https://www.googleapis.com/upload/drive/v3/files",
          method: "POST",
          params: {
            uploadType: "resumable",
          },
          headers: {
            "X-Upload-Content-Type": fichierUpload.type,
            "Content-Type": "application/json; charset=UTF-8",
            "Content-Length": JSON.stringify(bodyRequetinitiale).length,
          },
          body: bodyRequetinitiale,
        })
        .then(function (reponse) {
          gapi.client
            .request({
              path: reponse.headers.location,
              method: "PUT",
              headers: {
                "Content-Length": tailleResultat,
                "Content-Encoding": "base64",
              },
              body: bodyResultat,
            })
            .then(function (reponse) {
              afficherBarreProg = false;
              listFichiers();
            });
        });
    };
    reader.readAsBinaryString(fichierUpload);
  }
</script>

<div>
  <div class="navigation">
    <button id="btnRetour" on:click={gererClicRetour}>Retour</button>
    <div>
      <button id="btnColle" on:click={gererColle} disabled>Coller</button>
      <button on:click={gererClicAjoutFichier}>Ajouter un fichier</button>
    </div>
    <input
      type="file"
      id="inputFichier"
      style="display:none"
      on:change={gererUploadFichier}
    />
  </div>
  <!-- Affichage conditionnel de fichiers drive dans l'emplacement courant -->
  {#if fichiersDrive}
    <div class="chemin">{infoVue.cheminCourantString}</div>
    <!-- Boucle sur chaque fichier et dossier pour l'affichage grace au composant Fichier -->
    {#each fichiersDrive as fichier (fichier.id)}
      <Fichier
        id={fichier.id}
        nom={fichier.name}
        mimeType={fichier.mimeType}
        webContentLink={fichier.webContentLink}
        trashed={fichier.trashed}
        on:message={gererMessageFichier}
      />
    {/each}
    <!-- Affichage conditionnel de la barre de progres de l'upload d'un fichier -->
    {#if afficherBarreProg}
      <h3>Upload en cours</h3>
      <BarreProg />
    {/if}
  {/if}
</div>

<style>
  .navigation {
    display: flex;
    justify-content: space-between;
  }

  .chemin {
    background-color: orange;
    padding: 5px;
    margin-bottom: 8px;
    color: white;
    font-weight: bold;
  }

  button {
    cursor: pointer;
  }
</style>
