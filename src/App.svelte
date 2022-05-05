<script>
  import Banner from "./Components/Banner.svelte";
  import Game from "./Game.svelte";

  import Error from "./Components/Error.svelte";

  import io from "socket.io-client";
  let socket = io("https://levi-framed.herokuapp.com/");
  const urlParams = new URLSearchParams(window.location.search);
  let dev = urlParams.has("dev");
  if (dev) socket = io("ws://localhost:500");

  async function socketCheck() {
    await new Promise((res, rej) => {
      socket.on("connect", (check) => {
        res(check);
        console.log("Connected to Socket.io!");
      });
      socket.on("connect_error", (err) => {
        rej("Error connecting to server!");
      });
    });
  }
  let socketStart = socketCheck();

  let host;
  let roomCode;
  function updateRoomCode({ detail }) {
    host = detail.host;
    console.log(detail);
    roomCode = detail.room;
  }
</script>

<main>
  <Banner {host} {roomCode} />
  {#await socketStart}
    <p>Waiting!</p>
  {:then value}
    <Game {socket} bind:roomCode on:roomCodeChange={updateRoomCode} />
  {:catch error}
    <Error msg={error} />
  {/await}
</main>

<style lang="scss">
  @import url("https://fonts.googleapis.com/css2?family=Lexend+Deca:wght@400;700&display=swap");

  @mixin fullsize {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    padding: 0;
    margin: 0;
  }
  :global(body) {
    background-color: #141414;
  }
  :global(body),
  :global(html),
  main {
    font-family: "Lexend Deca", sans-serif;
    @include fullsize();
    display: flex;
    align-items: center;
    flex-direction: column;
  }
</style>
