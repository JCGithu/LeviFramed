<script>
  export let players;
  import PlayersList from "./PlayersList.svelte";
</script>

<h2>You are in the Lobby</h2>
<PlayersList {players} />
<h3>The host will start the game.</h3>
<h4>Why not grab some popcorn or a refreshing drink while you're here?</h4>

<style lang="scss">
</style>
