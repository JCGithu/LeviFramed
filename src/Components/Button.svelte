<script>
  export let style;
  export let disabled = false;
  export let error = false;
  export let func = null;
</script>

<button {disabled} on:click={func} class={style}>
  <slot />
</button>
{#if error}
  <code>{error}</code>
{/if}

<style lang="scss">
  button {
    background-color: var(--accent);
    color: white;
    font-weight: bold;
    border-radius: 1rem;
    border: 0;
    width: max-content;
    cursor: pointer;
    margin: 0;
    padding: 0.5rem 1rem;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.075, 0.8, 0.16, 1);
    &:hover {
      transform: scale(0.98);
      opacity: 0.9;
    }
    &:disabled {
      background-color: #cccccccc;
      color: #23232370;
      cursor: default;
      &:hover {
        transform: scale(1);
      }
    }
  }

  .wide {
    width: 100%;
    margin: 0.5rem 0;
    height: 3rem;
  }

  .inline {
    margin-right: 1rem;
  }

  .margin-top {
    margin-top: 0.5rem;
  }

  .vert {
    margin: 0.5rem;
  }

  code {
    text-align: center;
    color: red;
    padding: 0.2rem;
    margin: 0.2rem;
    width: auto;
  }
</style>
