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
  <h2>Re-Framed</h2>
  {#if roomCode}
    <span><b>{host ? "Hosting" : "Room"}</b>{roomCode}</span>
  {/if}

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
  h2 {
    color: white;
    height: 100%;
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
    justify-content: center;
    h2 {
      font-size: clamp(40px, 4vh, 200px);
      margin: 0;
      padding: 0;
      -webkit-filter: url(#chroma);
    }
  }
  span {
    color: white;
    position: absolute;
    right: 1rem;
    height: 100%;
    width: 10vw;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  input {
    position: absolute;
    left: 1rem;
    height: clamp(50px, 4vh, 200px);
    width: clamp(50px, 4vh, 200px);
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
      width: 100%;
      padding: 0;
      background-color: transparent;
      transition: 0.5s all;
      &:hover {
        opacity: 1;
      }
    }
    &::-webkit-color-swatch-wrapper {
      border: none;
      border-radius: 100%;
      padding: 0;
    }
    opacity: 1;
    cursor: pointer;
  }
</style>
