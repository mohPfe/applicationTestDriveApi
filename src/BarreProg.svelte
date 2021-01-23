<script>
</script>

<div class="conteneur">
  <div class="barre" />
</div>

<style>
  .conteneur {
    width: 100%;
    height: 5px;
    background-color: rgba(0, 0, 0, 0.3);
  }

  .barre {
    width: 25%;
    height: 100%;
    background-color: rgb(8, 128, 184);

    animation-name: barreInfinie;
    animation-duration: 1000ms;
    animation-timing-function: ease-in-out;
    animation-play-state: running;
    animation-direction: alternate-reverse;
    animation-iteration-count: infinite;
  }

  @keyframes barreInfinie {
    0% {
      margin-right: 75%;
      margin-left: 0%;
    }
    100% {
      margin-right: 0%;
      margin-left: 75%;
    }
  }
</style>
