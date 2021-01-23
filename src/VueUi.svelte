<script>
  import BarreProg from "./BarreProg.svelte";
  import VueChargement from "./VueChargement.svelte";
  export let prop;

  // variables qui controlent l'affichages des differents vues et composants
  let chargement = false;
  let enregistrement = false;

  // obtenir le contenu du fichier ouvert
  function getContenuFichierDrive() {
    chargement = true;
    gapi.client.drive.files
      .get({
        fileId: prop.ids[0],
        alt: "media",
      })
      .then(function (reponse) {
        console.log(reponse);
        setTexte(reponse.body);
        chargement = false;
      });
  }

  // gerer les proprietes passé par google drive
  if (prop.action == "open") {
    getContenuFichierDrive();
  }

  // fonction qui retourne le texte inseré dans la textarea
  function getTexte() {
    const elementTextArea = document.getElementById("texte");
    return elementTextArea.value;
  }

  // fonction qui insere du texte dans la textearea
  function setTexte(texte) {
    const elementTextArea = document.getElementById("texte");
    elementTextArea.value = texte;
  }

  // fonction qui obtient le nom choisi par l'utilisateur pour le fichier
  function getNomFichier() {
    return document.getElementById("nomFichier").value;
  }

  // gerer l'upload du fichier apres edition dans le deux cas, d'un fichier existant ou un nouveau fichier
  function gererUploadFichier(texte, nom) {
    enregistrement = true;
    const fichierUpload = new Blob([texte], {
      type: "text/plain; charset=UTF-8",
    });
    const reader = new FileReader();
    reader.onload = function () {
      const bodyResultat = btoa(reader.result);
      const tailleResultat = bodyResultat.length * (3 / 4) - 2;
      const bodyRequetinitiale = {
        name: nom,
        parents: [prop.folderId],
      };
      let requet = {
        path:
          prop.action == "open"
            ? `https://www.googleapis.com/upload/drive/v3/files/${prop.ids[0]}`
            : "https://www.googleapis.com/upload/drive/v3/files",
        method: `${prop.action == "open" ? "PATCH" : "POST"}`,
        params: {
          uploadType: "resumable",
        },
        headers: {
          "X-Upload-Content-Type": "text/plain; charset=UTF-8",
          "Content-Type": "application/json; charset=UTF-8",
          "Content-Length":
            prop.action == "open"
              ? 0
              : JSON.stringify(bodyRequetinitiale).length,
        },
      };
      if (prop.action == "create") {
        requet.body = bodyRequetinitiale;
      }
      gapi.client.request(requet).then(function (reponse) {
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
            enregistrement = false;
          });
      });
    };
    reader.readAsBinaryString(fichierUpload);
  }
</script>

<div>
  <h4>Inserer votre texte ici:</h4>
  <textarea id="texte" rows="15" />
  <div class="navigation">
    <input type="text" id="nomFichier" disabled={prop.action == "open"} />
    <button on:click={() => gererUploadFichier(getTexte(), getNomFichier())}
      >Enregistrer sur drive</button
    >
  </div>
  {#if chargement}
    <VueChargement />
  {/if}
  {#if enregistrement}
    <BarreProg />
  {/if}
</div>

<style>
  textarea {
    width: 100%;
  }

  .navigation {
    display: flex;
    margin-top: 15px;
  }

  input {
    width: 50%;
    margin-right: 10px;
  }
</style>
