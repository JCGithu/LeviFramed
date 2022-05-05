<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import { slide } from "svelte/transition";

  export let socket;
  import Button from "../Components/Button.svelte";
  import Error from "../Components/Error.svelte";

  let vert = false;

  //USERNAME
  let Username = "";
  let UsernameLength = false;
  let usernameButton = "Set Username";
  let usernameSet = false;
  let usernameButtonOff = true;
  let userPlaceholder = "Enter Username (Min. 4 characters)";

  //JOIN
  let joinCode = "";
  let joinButtonOff = true;
  let joinError = false;
  let joinText = "Join!";
  let joinPlaceholder = "Join an existing game";

  //HOST
  let hostButtonOff = true;

  //MOBILE
  if (window.innerWidth < 580) {
    userPlaceholder = "Username";
    usernameButton = "Enter";
    joinPlaceholder = "Room Code";
    vert = true;
  }

  //FUNCTIONS
  function getRandomInt(max, min) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  const handleInput = () => {
    UsernameLength = false;
    hostButtonOff = true;
    joinButtonOff = true;
    usernameButtonOff = true;
    if (Username.length >= 4 && Username.length < 25) {
      UsernameLength = true;
      usernameButtonOff = false;
      hostButtonOff = false;
    }
    if (UsernameLength && joinCode.length === 5) {
      joinButtonOff = false;
      hostButtonOff = true;
    }
  };

  const joinRoom = () => {
    socket.emit("room-exist", joinCode);
    joinText = "Checking room!";
    socket.on("room-exist-return", (exists) => {
      if (exists) {
        socket.emit("join-room", joinCode);
        dispatch("boot", {
          room: joinCode,
          username: Username,
          host: false,
        });
      } else {
        joinCode = "";
        joinText = "Join!";
        joinError = "Room does not exist, try again.";
      }
    });
  };

  const setUsername = () => {
    socket.emit("set-username", Username);
    Username = Username.toUpperCase();
    usernameButton = "⏳";
    socket.on("valid-username", (valid) => {
      if (valid) {
        usernameButton = `Welcome ${Username}!`;
        if (Username.length > 10) {
          usernameButton = `Welcome ${Username.substr(0, 10)}...!`;
        }
        usernameSet = true;
      } else {
        usernameButton = `${Username} taken!`;
        if (Username.length > 10) {
          usernameButton = `${Username.substr(0, 10)}... taken!`;
        }
        usernameSet = false;
      }
    });
  };

  let hostCode;
  async function roomCheckLoop() {
    return new Promise((res, req) => {
      hostCode = getRandomInt(99999, 10000);
      console.log(`Checking if room ${hostCode} exists`);
      socket.emit("room-exist", hostCode);
      socket.on("room-exist-return", async (exists) => {
        if (exists) {
          hostCode++;
          roomCheckLoop();
        } else {
          console.log(`Success, no room found! Now hosting with room code: ${hostCode}`);
          socket.emit("join-room", hostCode);
          dispatch("boot", {
            room: hostCode,
            username: Username,
            host: true,
          });
          res(hostCode);
        }
      });
    });
  }

  const hostGame = async () => {
    let roomCode = await roomCheckLoop();
    console.log(roomCode);
  };
</script>

<div>
  <header>
    <h2>Hi!</h2>
    This is like
    <a href="http://framed.wtf">Framed</a>, only with friends.
    <br />
    Join a room or host your own.
    <br />
    <br />
    <h3>How to Play:</h3>
    Each turn you will be shown a single image from a film.<br />Guess what you think it is! <br /> Points are earned based on how few turns you take to guess the film.
  </header>
  <div class="fadeIn inputGroup">
    <input type="text" bind:value={Username} on:input={handleInput} placeholder={userPlaceholder} />
    <Button disabled={usernameButtonOff} style={vert ? "vert" : "inline"} func={setUsername}>{usernameButton}</Button>
  </div>
  {#if usernameSet}
    <div class="fadeIn inputGroup">
      <input type="text" bind:value={joinCode} on:input={handleInput} placeholder={joinPlaceholder} />
      <Button disabled={joinButtonOff} style={vert ? "vert" : "inline"} func={joinRoom}>{joinText}</Button>
    </div>
    <Button style="fadeIn wide" disabled={hostButtonOff} func={hostGame}>Host a game!</Button>
  {/if}
  {#if joinError}
    <Error msg={joinError} />
  {/if}
  <footer>In chat no one can hear you scream...</footer>
</div>

<style lang="scss">
  header {
    padding: 0.5rem;
    margin: 0.5rem;
    text-align: center;
    h2,
    h3 {
      padding: 0;
      margin: 0;
      color: var(--accent);
    }
    a {
      text-decoration: underline;
      color: white;
      text-decoration-color: var(--accent);
      font-weight: bold;
      transition: all 0.3s;
      &:hover {
        color: var(--accent);
        text-decoration-color: white;
      }
    }
  }
  div {
    display: flex;
    flex-direction: column;
    width: min(80%, 520px);
    @media (max-width: 580px) {
      width: 100%;
    }
  }
  .inputGroup {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 3rem;
    border: 1px solid #ccc;
    border-radius: 1rem;
    margin: 0.5rem 0;
    @media (max-width: 580px) {
      flex-direction: column;
      height: 6rem;
      justify-content: center;
    }
    input {
      background-color: rgba(0, 0, 0, 0);
      color: white;
      margin: 0;
      padding: 1rem;
    }
  }
  input[type="text"] {
    border: none;
    flex-grow: 2;
    font-size: 1rem;
    border-radius: 1rem;
    outline: none;
    padding: 0.3rem 1rem;
    text-align: center;
    text-transform: uppercase;
    &:focus {
      outline: none;
    }
  }
  footer {
    width: 100vw;
    position: fixed;
    display: flex;
    justify-content: center;
    color: #ffffff10;
    bottom: 0;
    left: 0;
    @media (max-width: 580px) {
      font-size: 0.5rem;
    }
  }
</style>
