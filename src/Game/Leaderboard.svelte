<script>
  import Button from "../Components/Button.svelte";
  export let leaderboardData = [{ username: "" }];
  export let hosting;
  export let roomData;
  export let socket;

  let gameOver = false;
  let buttonText = `On to Round ${roomData.currentRound + 1}`;
  let leaveLeaderboard = () => {
    socket.emit("next-round", "");
  };

  if (roomData.currentRound === roomData.numberOfRounds) {
    gameOver = true;
    buttonText = "Cheeky one more?";
    leaveLeaderboard = () => {
      location.reload();
    };
  }

  console.log(roomData);
  import { fly } from "svelte/transition";
</script>

<div>
  <h1>Leaderboard!</h1>
  {#if gameOver}
    <h3>Congrats {leaderboardData[0].username}!</h3>
  {/if}
  <div class="customScroll">
    {#each leaderboardData as dataPoint, i}
      <span in:fly><b>{dataPoint.username}</b>: {dataPoint.points} points</span>
    {/each}
  </div>
  {#if hosting}
    <Button style="margin-top" disabled={gameOver} func={leaveLeaderboard}>{buttonText}</Button>
    <p />
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    div {
      max-height: 70%;
      overflow-y: auto;
    }
  }
  span {
    margin: 0.2rem;
    padding: 1rem;
    width: 50%;
    text-align: center;
    border-radius: 0.5rem;
    border: 2px solid rgba(red, 0);
    border-color: var(--accent);
  }
</style>
