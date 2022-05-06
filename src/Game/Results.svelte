<script>
  export let roundOutcome;
  export let data;
  import Button from "../Components/Button.svelte";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

<div id="results">
  <div id="resultText">
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
  <div id="resultImg"><img class="fadeIn" src={data.Poster} alt={data.Title} /></div>
</div>

<style lang="scss">
  #results {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 0px 0px;
    @media (max-width: 580px) {
      font-size: clamp(20px, 3vh, 40px);
      font-size: 0.8rem;
      padding: 1rem;
    }
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
  #resultText {
    grid-area: 1 / 1/ 3/ 2;
    @media (max-width: 580px) {
      grid-area: 2 / 1 / 3 / 3;
    }
  }
  #resultImg {
    grid-area: 1/2/3/3;
    @media (max-width: 580px) {
      grid-area: 1/1/2/3;
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
    @media (max-width: 580px) {
      max-height: 25vh;
    }
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
