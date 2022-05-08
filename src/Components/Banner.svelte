<script>
  export let host;
  export let roomCode;

  let gameColour = "#36d686";
  let updateColour = () => {
    console.log(gameColour);
    document.querySelector(":root").style.setProperty("--accent", gameColour);
  };
</script>

<header>
  <input type="color" bind:value={gameColour} on:change={updateColour} />
  <h2
    on:click={() => {
      location.reload();
    }}
  >
    Re-Framed
  </h2>
  <span>
    {#if roomCode}
      <b>{host ? "Hosting" : "Room"}</b>{roomCode}
    {/if}
  </span>

  <svg width="0" height="0">
    <filter id="chroma">
      <feColorMatrix
        type="matrix"
        result="red_"
        values="4 0 0 0 0
              0 0 0 0 0 
              0 0 0 0 0 
              0 0 0 1 0"
      />
      <feOffset in="red_" dx="1.5" dy="0" result="red" />
      <feColorMatrix
        type="matrix"
        in="SourceGraphic"
        result="blue_"
        values="0 0 0 0 0
              0 3 0 0 0 
              0 0 10 0 0 
              0 0 0 1 0"
      />
      <feOffset in="blue_" dx="-1.5" dy="0" result="blue" />
      <feBlend mode="screen" in="red" in2="blue" />
    </filter>
  </svg>
</header>

<style lang="scss">
  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0.3;
    }
  }
  h2 {
    color: white;
    font-size: clamp(40px, 4vh, 200px);
    @media (max-width: 580px) {
      font-size: clamp(20px, 3vh, 40px);
    }
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 0;
    cursor: pointer;
    -webkit-filter: none;
    width: 50vw;
    height: 100%;
    transition: all 2s;
    &:hover {
      -webkit-filter: url(#chroma);
    }
  }
  header {
    position: relative;
    top: 0rem;
    border-bottom: 3px solid #ffffff;
    width: 100vw;
    min-height: 50px;
    height: 5%;
    height: clamp(50px, 5vh, 200px);
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media (max-width: 580px) {
      height: clamp(30px, 5vh, 50px);
    }
  }
  span {
    color: white;
    height: 100%;
    width: 25vw;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    @media (max-width: 580px) {
      font-size: 0.8rem;
    }
  }
  input {
    width: 25vw;
    height: 100%;
    border: none;
    outline: none;
    margin: 0;
    padding: 0.5vh;
    border-color: transparent;
    background-color: transparent;
    appearance: none;
    border-radius: 20px;
    &::-webkit-color-swatch {
      opacity: 0.3;
      border: none;
      border-radius: 10px;
      height: 100%;

      padding: 0;
      background-color: transparent;
      transition: 0.5s all;
      &:hover {
        opacity: 1;
      }
      @media (max-width: 580px) {
        //transform: scale(0.5);
      }
    }
    &::-webkit-color-swatch-wrapper {
      margin: 0;
      padding: 0;
      clip-path: circle(1.5vh at 5vw);
    }
    opacity: 1;
    cursor: pointer;
  }
</style>
