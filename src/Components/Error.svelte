<script>
  export let msg;
</script>

<div>{msg}</div>

<style lang="scss">
  div {
    background-color: rgb(255, 100, 100);
    text-align: center;
    border-radius: 1rem;
    font-size: large;
    font-weight: bold;
    padding: 1rem;
    color: white;
    margin: 1rem;
    animation: popIn 0.4s cubic-bezier(0.3, 1.3, 0.6, 1);
  }
  @keyframes popIn {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
</style>
