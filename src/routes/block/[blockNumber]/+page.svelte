<script>
  import { onMount } from 'svelte';
  import { camelToHuman } from '$lib/utils/utils';

  export let data;

  let latestBlockNumber = data.currentBlockNumber;

    // Updating to latest block number with a websocket
    onMount(() => {
        const ws = new WebSocket('ws://127.0.0.1:8545');

        ws.onopen = () => {
        ws.send(JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_subscribe",
            params: ["newHeads"]
        }));
        };

        ws.onmessage = event => {
        const msg = JSON.parse(event.data);
        if (msg.method === "eth_subscription") {
            latestBlockNumber = parseInt(msg.params.result.number, 16);
        }
        };

        ws.onerror = console.error;
        return () => ws.close();
    });

  $: previousBlockNumber = data.blockNumber > 0 ? data.blockNumber - 1 : null
  $: nextBlockNumber = previousBlockNumber + 2 <= latestBlockNumber ? previousBlockNumber + 2 : null

  $: blockInTheFuture = data.blockNumber > latestBlockNumber

  $: if (!blockInTheFuture && !data.block) {
    location.reload();
  }

</script>

{#if blockInTheFuture}
  <h1>Block {data.blockNumber} is in the future</h1>
  <p>Waiting for it to be mined... Current block is  <a href="/block/{latestBlockNumber}">{latestBlockNumber}</a>.</p>
{:else}
  {#if previousBlockNumber != null}
    <a href="/block/{previousBlockNumber}">Previous</a>
  {/if} 
  ------------------------------- 
  {#if nextBlockNumber != null}
    <a href="/block/{nextBlockNumber}">Next</a>
------>
    <a href="/block/latest">Latest</a>
  {/if}

  <!--<h1>Details for block {parseInt(data.block['number'])} </h1>-->
  <h1>Details for block {parseInt(data.blockNumber)} </h1>

  <table>
    <thead>
      <tr>
        <th>Previous block</th>
      </tr>
    </thead>
    <tbody>
      <ul>
        <tr>
          <td> Number :</td>
          <td>{previousBlockNumber}</td>
        </tr>
        <tr>
          <td> Hash :</td>
          <td>{data.block.parentHash}</td>
        </tr>
      </ul>
    </tbody>
  </table>

  <table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(data.block) as [key, value] (key)}
        <tr>
          <td>{camelToHuman(key)}</td>

          {#if key === 'parentHash' && value !== '0x0000000000000000000000000000000000000000000000000000000000000000'}
            <td><code><a href="/block/{value}">{value}</a></code></td>

          {:else if key === 'miner' && value !== '0x0000000000000000000000000000000000000000'}
            <td><code><a href="/address/{value}">{value}</a></code></td>

          {:else if key === 'transactions'}
            <td colspan="2">
              <table>
                <tbody>
                  {#each value as txHash}
                    <tr>
                      <td><a href="/tx/{txHash}"><code>{txHash}</code></a></td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </td>

          {:else if key === 'number' || key === 'gasLimit' || key === 'gasUsed'  || key === 'size'}
            <td>{parseInt(value)}</td>
          {:else if key === 'baseFeePerGas'}
            <td>{parseInt(value)/10**9} gwei</td>

          {:else if key === 'timestamp'}
            <td>{Date(parseInt(value) * 1000)}</td>

          {:else}
            <td><code>{value}</code></td>
          {/if}

        </tr>
      {/each}
    </tbody>
  </table>
{/if}



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