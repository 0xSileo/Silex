<script>
  import { camelToHuman } from '$lib/utils/utils';
  
  export let data;
  const numberKeys = ["nonce","transactionIndex","gas","type", "chainId"];
  const ethKeys = ["value"];
  const gweiKeys = ["gasPrice","maxFeePerGas","maxPriorityFeePerGas",];


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
          {:else if ethKeys.includes(key)}
          <td>{parseInt(value)/1e18} ETH</td>
          {:else if gweiKeys.includes(key)}
          <td>{parseInt(value)/1e9} gwei</td>
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
