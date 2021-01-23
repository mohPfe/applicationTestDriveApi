<script>
  //  creation d'un animation de chargement qui occupe toute la page
</script>

<div class="conteneur">
  <div class="roue" />
</div>

<style>
  .conteneur {
    display: flex;
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.5);
    justify-content: center;
    align-items: center;
  }

  .roue {
    border: 20px solid #f3f3f3;
    border-top: 20px solid #555;
    border-radius: 50%;
    width: 240px;
    height: 240px;
    animation: tourner 2s linear infinite;
  }

  @keyframes tourner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
