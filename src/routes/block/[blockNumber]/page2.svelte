<script>

  export let data;

  $: previousBlockNumber = data.blockNumber > 0 ? data.blockNumber - 1 : null
  $: nextBlockNumber = previousBlockNumber + 2 <= data.currentBlockNumber ? previousBlockNumber + 2 : null
  

  function camelToHuman(camelStr) {
    if (!camelStr) return '';

    const words = camelStr
      .replace(/([A-Z])/g, ' $1')     // insert space before uppercase letters
      .toLowerCase();                 // convert entire string to lowercase

    return words.charAt(0).toUpperCase() + words.slice(1);
  }
  
</script>


{#if previousBlockNumber != null}
<a href="/block/{previousBlockNumber}">Previous</a>
{/if} 
------------------------------- 
{#if nextBlockNumber != null}
<a href="/block/{nextBlockNumber}">Next</a>
{/if}



<table>
  <thead>
    <tr>
      <th>Key</th>
      <th>Value</th>
    </tr>
  </thead>
  <tbody>
    <ul>
      {#each Object.entries(data.block) as [key, value] (key)}
      <tr>
        <td>{camelToHuman(key)}</td>
        {#if key=='parentHash' && value != '0x0000000000000000000000000000000000000000000000000000000000000000'}
          <td><code><a href="/block/{value}">{value}</a></code></td>
        {:else if key=='miner' && value != '0x0000000000000000000000000000000000000000'}
          <td><code><a href="/address/{value}">{value}</a></code></td>
          {:else if key=='logsBloom'}
        {:else if key=='transactions'}
        <table>
          {#each value as txHash}
            <tr>
              <td><a href="/tx/{txHash}"><code>{txHash}</code></a></td>
            </tr>
          {/each}
        </table>
        {:else if key=='number' || key=='gasLimit' || key=='gasUsed' || key=='timestamp' || key=='size'}
          <td>{parseInt(value)}</td>
        {:else}
          <td><code>{value}</code></td>
        {/if}
  
      </tr>
    {/each}
    </ul>
  </tbody>
</table>


<style>

table {
  border:1px solid black
}

tr {
  max-width: 700px;
}

td {
  max-width: 700px;
  overflow: auto;
}



</style>