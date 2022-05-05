<script>
  export let roundOutcome;
  export let data;
  import Button from "../Components/Button.svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

<div id="results">
  <div>
    {#if roundOutcome.won}
      <h2>Congrats!</h2>
      <p>You got it in {roundOutcome.turns}</p>
      <section>
        {#each { length: 5 } as _, i}
          <span class={roundOutcome.turns > i + 1 ? "red" : roundOutcome.turns < i + 1 ? "" : "green"} />
        {/each}
      </section>
    {/if}
    <a href={data.IMDB}><h2>{data.Title} ({data.Year})</h2></a>
    <p>Directed by {data.Director}<br /> Written by {data.Screenwriter}<br />Starring {data.Starring}</p>
    <Button
      style="margin-top"
      func={() => {
        dispatch("roundOver");
      }}>Go to Leaderboard</Button
    >
  </div>
  <div><img class="fadeIn" src={data.Poster} alt={data.Title} /></div>
</div>

<style lang="scss">
  #results {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    gap: 0px 0px;
    height: auto;
    padding: 2rem;
    div {
      display: flex;
      flex-direction: column;
      width: 100%;
      text-align: center;
      position: relative;
      align-items: center;
    }
  }
  a {
    color: var(--accent);
  }
  h2,
  p {
    margin: 0.2rem 0rem;
  }
  img {
    max-width: calc(100% - 2rem);
    object-fit: cover;
    position: relative;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  }
  section {
    display: flex;
    flex-direction: row;
  }
  span {
    height: 1rem;
    width: 1rem;
    border-radius: 0.1rem;
    margin: 0.1rem;
    position: relative;
    background-color: rgba(0, 0, 0, 0.5);
    &.green {
      background-color: var(--accent) !important;
    }
    &.red {
      background-color: rgb(255, 100, 100) !important;
    }
  }
</style>
