<script>
  export let players = [];
  import { fly } from "svelte/transition";
</script>

<section in:fly={{ y: 110 }}>
  <h4>Players in Lobby</h4>
  <div class="customScroll">
    {#each players as player}
      <span in:fly={{ y: 20 }} class="player">{player}</span>
    {/each}
  </div>
</section>

<style lang="scss">
  h4 {
    margin: 0.1rem;
    margin-bottom: 0.5rem;
    text-align: center;
  }
  div {
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    text-align: center;
    overflow-y: auto;
  }
  section {
    overflow: hidden;
    bottom: 0;
    position: fixed;
    width: min(80%, 520px) !important;
    max-height: 50%;
    width: 100%;
    border-radius: 2rem 2rem 0 0;
    padding-top: 1rem;
    background-color: rgba(255, 255, 255, 0.1);
    overflow: hidden;
    pointer-events: none;
    @media (max-width: 580px) {
      position: relative;
      border-radius: 2rem;
    }
    @media (max-height: 850px) {
      position: relative;
      border-radius: 2rem;
    }
  }
  span {
    border-radius: 0.5rem;
    padding: 0.2rem 1rem;
    margin: 0.2rem;
    display: inline-block;
    border: 2px solid var(--accent);
  }
</style>
