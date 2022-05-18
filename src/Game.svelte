<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let socket;
  import IntroScreen from "./Game/IntroScreen.svelte";
  import Lobby from "./Game/Lobby.svelte";
  import HostSettings from "./Game/HostSettings.svelte";
  import FilmPicker from "./Game/FilmPicker.svelte";
  import Leaderboard from "./Game/Leaderboard.svelte";

  let filmDataB, filmNamesB, filmTotalB;

  fetch("filmData.json").then(async (res) => {
    filmDataB = await res.json();
    filmNamesB = Object.keys(filmDataB);
    filmTotalB = filmNamesB.length;
    console.log(`There are ${filmTotalB} B films!`);
  });

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

  socket.on("player-joined", (users) => (players = users));

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

  let userLogged = false;
  socket.on("round-start", (data) => {
    roomData = data;
    gameRunning = true;
    leaderboardOn = false;
    if (!userLogged) {
      socket.emit("log-user", data);
      userLogged = true;
    }
  });

  socket.on("leaderboard-update", (board) => (leaderboardData = board));

  function showLeaderboard({ detail }) {
    console.log(detail);
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
      <HostSettings on:startGame={hostStarts} {players} {roomCode} />
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
