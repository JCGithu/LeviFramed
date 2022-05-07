<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let socket;
  import IntroScreen from "./Game/IntroScreen.svelte";
  import Lobby from "./Game/Lobby.svelte";
  import HostSettings from "./Game/HostSettings.svelte";
  import FilmPicker from "./Game/FilmPicker.svelte";
  import Leaderboard from "./Game/Leaderboard.svelte";
  import filmData from "../filmData.json";

  let filmNames = Object.keys(filmData);
  let filmTotal = filmNames.length;
  console.log(`There are ${filmTotal} films!`);
  let gameBooted = false;
  let gameRunning = false;
  let leaderboardOn = false;
  let hosting;
  let roomData;
  let leaderboardData;
  export let roomCode;
  let players = [];
  console.log(filmData);

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function generateFilms(rounds) {
    let storage = window.localStorage;
    let previous = [];

    if (storage.getItem("previous")) {
      previous = JSON.parse(storage.getItem("previous"));
      if (previous.length + rounds > filmTotal) previous = [];
    }

    let filmsChosen = [];
    while (filmsChosen.length != rounds) {
      let filmNum = getRandomInt(filmTotal);
      if (!filmsChosen.includes(filmNum) && !previous.includes(filmNum)) {
        filmsChosen.push(filmNum);
        previous.push(filmNum);
      }
    }
    storage.setItem("previous", JSON.stringify(previous));
    return filmsChosen;
  }

  socket.on("player-joined", (users) => {
    console.log("Player joined room");
    console.log(users);
    players = users;
  });

  function bootGame({ detail }) {
    gameBooted = true;
    roomCode = detail.room;
    dispatch("roomCodeChange", detail);
    hosting = detail.host;
    console.log(detail);
  }

  function hostStarts({ detail }) {
    if (detail.numberOfRounds > filmTotal) detail.numberOfRounds = filmTotal;
    let generated = generateFilms(detail.numberOfRounds);
    detail.films = generated;
    console.log(detail);
    socket.emit("host-start", detail);
  }

  socket.on("round-start", (data) => {
    roomData = data;
    gameRunning = true;
    leaderboardOn = false;
  });

  socket.on("leaderboard-update", (board) => {
    leaderboardData = board;
    console.log("Leaderboard Updated");
    console.log(leaderboardData);
  });

  function showLeaderboard({ detail }) {
    socket.emit("user-round", detail);
    leaderboardOn = true;
  }
</script>

<game class="customScroll">
  {#if gameRunning}
    {#if leaderboardOn}
      <Leaderboard {socket} {leaderboardData} {hosting} {roomData} />
    {:else}
      <FilmPicker on:roundOver={showLeaderboard} {roomData} {filmData} {filmNames} />
    {/if}
  {:else if gameBooted}
    {#if hosting}
      <HostSettings on:startGame={hostStarts} {players} />
    {:else}
      <Lobby {players} />
    {/if}
  {:else}
    <IntroScreen on:boot={bootGame} {socket} {filmTotal} />
  {/if}
</game>

<style lang="scss">
  game {
    color: white;
    width: min(80vw, 700px);
    height: calc(100vh - 3rem);
    padding: 1rem;
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
    @media (max-width: 580px) {
      width: 92vw;
      padding: 0.5rem;
    }
  }
</style>
