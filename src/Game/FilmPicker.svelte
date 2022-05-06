<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import { slide } from "svelte/transition";

  import Button from "../Components/Button.svelte";
  import Results from "./Results.svelte";

  export let roomData;
  export let filmData;
  export let filmNames;

  let imgSRC;
  let turn = 1;
  let currentImg = 1;
  let currentGuess;
  let guesses = [];
  let buttonText = "Guess!";
  let showSearch = false;
  let roundOver = false;
  let roundOutcome;
  let noGuess = true;
  for (let i = 0; i < 5; i++) {
    guesses.push({ text: "", outcome: "blank" });
  }
  if (window.innerHeight < 850 || window.innerWidth < 580) {
    guesses = [];
  }
  let autoselect = [];
  console.log(roomData);

  let roundIndex = roomData.currentRound - 1;
  let filmThisRound = {
    name: filmNames[roomData.films[roundIndex]],
    id: roomData.films[roundIndex],
  };
  Object.assign(filmThisRound, filmData[filmThisRound.name]);
  console.log(filmThisRound);

  function setImage(num) {
    if (num === undefined) return;
    if (!filmThisRound[num]) {
      console.log("Image missing!");
      imgSRC = "https://i1.wp.com/www.joshuacasper.com/contents/uploads/media-offline-adobe-media-encoder-fixed.jpg?ssl=1";
      return;
    }
    imgSRC = `${filmThisRound.prefix}${filmThisRound[num]}`;
  }
  setImage(turn - 1);

  const handleInput = () => {
    if (currentGuess === "" || currentGuess === " ") {
      noGuess = true;
      autoselect = [];
      return;
    }
    noGuess = false;
    let barInput = currentGuess.toUpperCase();
    for (let j = autoselect.length - 1; j >= 0; j--) {
      if (!autoselect[j]) continue;
      let word = autoselect[j];
      console.log(autoselect);
      console.log(`${j}:${word}, ${barInput}, ${word.includes(barInput)}`);
      if (word.includes(barInput)) continue;
      autoselect.splice(j, 1);
      autoselect = autoselect;
    }
    for (let i = 0; i < filmNames.length; i++) {
      if (autoselect.includes(filmNames[i])) continue;
      if (filmNames[i].includes(barInput)) {
        autoselect = [...autoselect, filmNames[i]];
        if (autoselect.length >= 6) break;
      }
    }
  };

  function updateImg(i) {
    currentImg = i + 1;
    setImage(i);
  }

  function setGuess(data) {
    autoselect = [];
    currentGuess = data;
  }

  function addGuess() {
    if (!guesses[turn - 1]) {
      guesses[turn - 1] = { text: "", outcome: "blank" };
    }
    let guessTarget = guesses[turn - 1];
    guessTarget.text = currentGuess;
    roundOutcome = {
      turns: turn,
      won: null,
    };
    if (currentGuess === filmThisRound.name) {
      roundOver = true;
      roundOutcome.won = true;
      updateImg(turn - 1);
      turn = 5;
      showSearch = true;
      currentGuess = "";
      guessTarget.outcome = "correct";
      guesses = guesses;
      buttonText = "Correct!";
      return;
    }
    currentGuess = "";
    autoselect = [];
    guessTarget.outcome = "wrong";
    guesses = guesses;
    noGuess = true;
    if (guesses[4]) {
      if (guesses[4].outcome === "wrong") {
        roundOutcome.won = false;
        roundOver = true;
        return;
      }
    }
    updateImg(turn);
    turn = turn + 1;
  }

  function goToLeaderboard() {
    dispatch("roundOver", roundOutcome);
  }
</script>

<div class="customScroll" id="picker">
  <div id="topBox">
    <img src={imgSRC} alt={filmThisRound.id} />
    <div class="numList">
      {#each { length: turn } as _, i}
        <div
          on:click={() => {
            updateImg(i);
          }}
          class={currentImg === i + 1 ? "selected" : ""}
        >
          {i + 1}
        </div>
      {/each}
    </div>
  </div>
  {#if !roundOver}
    <ul id="guessGrid">
      {#each guesses as guess}
        <li in:slide={{ duration: 200 }} class={guess.outcome}>{guess.text}</li>
      {/each}
    </ul>
    <div id="inputBox" hidden={showSearch}>
      <input type="text" bind:value={currentGuess} on:input={handleInput} />
      <ul id="autoselect">
        {#each autoselect as auto, i}
          <li
            in:slide={{ duration: 200 }}
            out:slide={{ duration: 100 }}
            name={auto}
            on:click={() => {
              setGuess(auto);
            }}
          >
            {auto}
          </li>
        {/each}
      </ul>
    </div>
    <Button disabled={noGuess} style="wide" func={addGuess}>{buttonText}</Button>
  {:else}
    <Results on:roundOver={goToLeaderboard} {roundOutcome} data={filmThisRound} />
  {/if}
</div>

<style lang="scss">
  img {
    max-width: 100%;
    width: max-content;
    max-height: 35vh;
    border-radius: 1rem;
    object-fit: cover;
    position: relative;
    outline: 2px rgba(1, 1, 1, 0.2) solid;
    box-shadow: 5px 5px 9px rgb(0 0 0 / 20%);
  }
  #guessGrid {
    width: 100%;
    text-align: center;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    margin: 1rem 0;
    padding: 0;
    li {
      width: 100%;
      margin: 0.3rem;
      border-radius: 0.5rem;
      list-style-type: none;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 3rem;
      box-shadow: inset 0px 0px 0px 1px rgb(255, 255, 255), 2px 2px 8px rgba(0, 0, 0, 0.1);
      &.correct {
        background-color: rgba(54, 214, 134, 0.2);
      }
      &.wrong {
        background-color: rgba(255, 0, 0, 0.25);
      }
    }
    @media (max-width: 580px) {
      li {
        font-size: 0.8rem;
        height: 1.7rem;
      }
    }
    @media (max-height: 850px) {
      li {
        border-radius: 0rem;
        margin: 0;
        font-size: 0.8rem;
        height: max-content;
        //min-height: 1rem;
        //padding: 0.2rem;
      }
      :last-child {
        border-radius: 0 0 0.5rem 0.5rem;
        margin-bottom: 0.25rem;
      }
      :first-child {
        border-radius: 0.5rem 0.5rem 0 0;
        margin-top: 0.25rem;
      }
      :only-child {
        border-radius: 0.5rem;
        margin: 0.25rem 0;
      }
    }
  }
  input {
    width: 100%;
    border: none;
    outline: none;
    border-radius: 0.5rem;
    height: 3rem;
    padding: 1rem;
    margin-bottom: 0;
    font-weight: bold;
    background-color: rgba(220, 220, 220, 0.1);
    text-transform: uppercase;
    transition: all 1s;
    color: white;
    box-shadow: inset 0px 0px 5px black;
    &:before {
      content: "hello";
      position: relative;
      display: inherit;
      color: red;
    }
    &:hover {
      background-color: rgba(220, 220, 220, 0.2);
    }
    &:focus {
      background-color: rgba(220, 220, 220, 0.2);
      box-shadow: inset 0px 0px 0px transparent;
      //box-shadow: inset 0px -204px 0px -200px var(--accent);
    }
    @media (max-width: 580px) {
      font-size: 0.8rem;
      height: 1.7rem;
    }
    @media (max-height: 850px) {
      font-size: 0.8rem;
      height: 1.7rem;
    }
  }
  #inputBox {
    width: 100%;
    position: relative;
  }
  #autoselect {
    position: absolute;
    width: 100%;
    padding: 0;
    margin: 0;
    bottom: 3rem;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    li {
      font-weight: bold;
      list-style-type: none;
      background: rgba(0, 0, 0, 0.8);
      border: 1px white solid;
      cursor: pointer;
      padding: 0.2rem;
    }
    @media (max-width: 580px) {
      font-size: 0.8rem;
      bottom: 1.9rem;
    }
    @media (max-height: 850px) {
      font-size: 0.8rem;
      bottom: 1.9rem;
    }
  }
  .numList {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 2rem;
    margin-top: 0.5rem;
    div {
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      width: 2rem;
      height: 2rem;
      margin: 0 0.2rem;
      border-radius: 0.2rem;
      background-color: rgba(54, 214, 134, 0.3);
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      &:hover {
        opacity: 0.9;
      }
      &.selected {
        background-color: var(--accent);
      }
    }
  }
  #topBox {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  #picker {
    height: 100%;
  }
</style>
