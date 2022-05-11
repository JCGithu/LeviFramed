<script>
  import Button from "../Components/Button.svelte";
  import PlayersPoints from "./PlayersPoints.svelte";

  export let leaderboardData = [{ username: "" }];
  export let hosting;
  export let roomData;
  export let socket;

  $: {
    leaderboardUpdate(leaderboardData);
  }

  let waitingForPlayers = true;
  let topPlayers = [];
  function leaderboardUpdate(newData) {
    topPlayers = [newData[0].username];
    for (let j = 1; j < newData.length; j++) {
      if (newData[j].points != newData[0].points) break
      topPlayers.push(newData[j].username);
    }
    for (let i = 0; i < newData.length; i++) {
      if (newData[i].round !== roomData.currentRound) {
        waitingForPlayers = true;
        return;
      }
    }
    waitingForPlayers = false;
  }

  let gameOver = false;
  let reveal = false;
  let leaveLeaderboard = () => {
    socket.emit("next-round", "");
  };

  if (roomData.currentRound === roomData.numberOfRounds) {
    gameOver = true;
    leaveLeaderboard = () => {
      if (confirm(`This will reload the page for a new game, are you sure?`) == true) {
        location.reload();
      }
    };
  }
</script>

<div>
  {#if gameOver}
    <h1>Final Round</h1>
    {#if waitingForPlayers}
      <h2>Waiting for players to finish...</h2>
    {:else}
      {#if !reveal}
        <Button func={()=>{reveal = true}}>Reveal final results!</Button>
      {:else}
        <h1>The winner{topPlayers.length > 1 ? 's are': ' is'} <br>{topPlayers.toString().replace(',', ', ')}!</h1>
        <Button style="wide margin-top" func={leaveLeaderboard}>Replay?</Button>
        <PlayersPoints {leaderboardData} {roomData}/>
      {/if}
    {/if}
  {:else}
    <h1>Leaderboard!</h1>
    {#if hosting}
      <Button style="vert" disabled={waitingForPlayers} func={leaveLeaderboard}>{waitingForPlayers ? "Waiting for players" : `On to Round ${roomData.currentRound + 1}`}</Button>
    {/if}
    <PlayersPoints {leaderboardData} {roomData}/>
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  h1{
    text-align: center;
  }
</style>
