<script>
  export let leaderboardData;
  export let roomData;
  import { fly } from "svelte/transition";
</script>

<div>
  {#each leaderboardData as dataPoint, i}
    <span in:fly class={dataPoint.round === roomData.currentRound ? "submitted" : ""}><b>{dataPoint.username}</b>: {dataPoint.points} points</span>
  {/each}
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  span {
    margin: 0.2rem;
    padding: 1rem;
    width: 50%;
    text-align: center;
    border-radius: 0.5rem;
    transition: 0.5s all;
    opacity: 0.5;
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
  .submitted {
    border-color: var(--accent);
    opacity: 1;
  }
</style>
