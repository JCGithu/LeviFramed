<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import { fly } from "svelte/transition";

  import Button from "../Components/Button.svelte";
  import PlayersList from "./PlayersList.svelte";

  let roundTimerOn;
  export let players;

  let roundNumber = 5;
  let roundTimer = 60;

  function handleKeydown(e) {
    if (e.key === "ArrowUp") numUp();
    if (e.key === "ArrowDown") numDown();
  }

  function numUp() {
    if (roundNumber === 10) return;
    roundNumber = roundNumber + 1;
  }

  function numDown() {
    if (roundNumber === 1) return;
    roundNumber = roundNumber - 1;
  }

  function startGame() {
    dispatch("startGame", {
      numberOfRounds: roundNumber,
      roundTimer: roundTimerOn ? roundTimer : null,
    });
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div>
  <h1>Settings</h1>
  <div class="inputGroup">
    <h3>Number of Rounds</h3>
    <span id="inputWrap">
      <input type="number" min="1" max="10" bind:value={roundNumber} />
      <div in:fly={{ x: 50 }} on:click={numUp}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
          ><path
            d="M21.69 4.887c-.102-1.34-1.133-2.475-2.577-2.578C17.052 2.103 14.165 2 12 2s-5.052.103-7.113.31c-.722 0-1.34.309-1.753.824-.412.515-.722 1.031-.825 1.753C2.103 6.948 2 9.835 2 12s.206 5.052.31 7.113c.102 1.34 1.133 2.475 2.577 2.578C6.948 21.897 9.835 22 12 22s5.052-.206 7.113-.31c1.34-.102 2.475-1.133 2.578-2.577.206-2.061.309-4.948.309-7.113s-.103-5.052-.31-7.113Zm-5.05 8.66c-.207.102-.31.206-.516.206a.788.788 0 0 1-.516-.207l-3.402-3.402a.314.314 0 0 0-.412 0l-3.402 3.402a.809.809 0 0 1-1.134 0 .809.809 0 0 1 0-1.134L10.66 9.01a1.805 1.805 0 0 1 2.577 0l3.402 3.402c.31.413.31.825 0 1.134Z"
            fill="#232323"
          /></svg
        >
      </div>
      <div in:fly={{ x: 50, delay: 200 }} on:click={numDown}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
          ><path
            d="M21.69 4.887c-.102-1.34-1.133-2.475-2.577-2.578C17.052 2.103 14.165 2 12 2s-5.052.103-7.113.31c-.722 0-1.34.309-1.753.824-.412.515-.722 1.031-.825 1.753C2.103 6.948 2 9.835 2 12s.206 5.052.31 7.113c.102 1.34 1.133 2.475 2.577 2.578C6.948 21.897 9.835 22 12 22s5.052-.206 7.113-.31c1.34-.102 2.475-1.133 2.578-2.577.206-2.061.309-4.948.309-7.113s-.103-5.052-.31-7.113Zm-5.05 6.598-3.403 3.402c-.31.309-.825.515-1.237.515-.412 0-.928-.206-1.237-.515L7.36 11.485a.809.809 0 0 1 0-1.134.809.809 0 0 1 1.134 0l3.402 3.402c.103.103.31.103.412 0l3.402-3.402a.809.809 0 0 1 1.134 0c.104.412.104.824-.206 1.133Z"
            fill="#232323"
          /></svg
        >
      </div>
    </span>
  </div>
  <!--   
  <h3>Round Timer</h3>
  <label>
    <input type="checkbox" bind:checked={roundTimerOn} />
  </label>
  {#if roundTimerOn}
    <div transition:slide>
      <h3>Round length<br />(Seconds)</h3>
      <input type="number" min="1" bind:value={roundTimer} max="240" />
    </div>
  {/if} 
  -->
  <Button style="wide margin-top" func={startGame}>Play!</Button>
  <PlayersList {players} />
</div>

<style lang="scss">
  div {
    display: flex;
    width: min(80%, 520px);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
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
    h3 {
      margin: 0;
      padding: 0 1rem;
    }
    input {
      background-color: rgba(0, 0, 0, 0);
      color: white;
      margin: 0;
      margin-top: 2px;
      padding: 1rem;
      border: none;
      outline: none;
      position: relative;
    }
  }
  input {
    width: max-content;
  }
  #player {
    background-color: green;
    border-radius: 0.4rem;
    padding: 0.3rem 1rem;
    font-weight: bold;
    margin: 0.3rem;
  }

  input[type="number"] {
    transform: rotate(5deg);

    &::-webkit-inner-spin-button {
      appearance: none;
      cursor: pointer;
      pointer-events: none;
      display: block;
      width: 8px;
      color: rgb(248, 248, 248);
      text-align: center;
      position: relative;
    }
  }

  #inputWrap {
    position: relative;
    transform: rotate(-5deg);
    overflow: hidden;
    :nth-child(2),
    :nth-child(3) {
      content: "^";
      position: absolute;
      user-select: none;
      cursor: pointer;
      opacity: 1;
      font-weight: bold;
      transition: 0.3s all ease-in-out;
      width: 14px;
      height: 14px;
      border-radius: 3px;
      background-color: white;
      color: #232323;
      right: 10px;
      &:hover {
        opacity: 0.9;
        transform: scale(0.9);
      }
    }
    :nth-child(2) {
      top: 10px;
    }
    :nth-child(3) {
      bottom: 8px;
    }
  }
</style>
