<script>
    export let data;
    const numberKeys = ["nonce","transactionIndex","value","gasPrice","gas","maxFeePerGas","maxPriorityFeePerGas","type"];


    function camelToHuman(camelStr) {
      if (!camelStr) return '';

      const words = camelStr
        .replace(/([A-Z])/g, ' $1')     // insert space before uppercase letters
        .toLowerCase();                 // convert entire string to lowercase

      return words.charAt(0).toUpperCase() + words.slice(1);
    }
</script>

Transaction details

<table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
        <ul>
        {#each Object.entries(data.tx) as [key, value] (key)}
        <tr>
          <td>{camelToHuman(key)}</td>
          {#if numberKeys.includes(key)}
          <td>{parseInt(value)}</td>
          {:else if key=="blockHash"}
          <td><code><a href="/block/{value}">{value}</a></code></td>
          {:else if key=="blockNumber"}
          <td><a href="/block/{parseInt(value)}">{parseInt(value)}</a></td>
          {:else if key=="from" || key=="to"}
          <td><code><a href="/address/{value}">{value}</a></code></td>
          {:else}


          <td><code>{value}</code></td>
        {/if}

      </tr>
      {/each}
    </tbody>
  </table>
