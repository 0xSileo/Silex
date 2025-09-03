<script>
  import { onMount } from 'svelte';
  import { camelToHuman, BLOCK_TIME, hexToAscii } from '$lib/utils/utils';

  export let data;

  let latestBlockNumber = data.currentBlockNumber;
  let showTransactions = false;
  let showWithdrawals = false;
  let showLogsBloom = false;

  let etaTimestamp;
  
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

  $: if (blockInTheFuture) {
    let approximateSecondsDelta = (data.blockNumber - latestBlockNumber)*BLOCK_TIME
    let currentBlockTimestamp = parseInt(data.currentBlock.timestamp)

    etaTimestamp = currentBlockTimestamp + approximateSecondsDelta
  }

  $: if (!blockInTheFuture && !data.block) {
    location.reload();
  }

</script>

{#if blockInTheFuture}
  <h1>Block {data.blockNumber} is in the future</h1>
  <p>Waiting for it to be mined... Current block is  <a href="/block/{latestBlockNumber}">{latestBlockNumber}</a>. If all slots are filled, the block should be mined on {new Date(etaTimestamp*1000)}</p>
{:else}
  <h1>  {#if previousBlockNumber != null}<a href="/block/{previousBlockNumber}">&lt;</a>{/if}  Details for block {parseInt(data.blockNumber)}  {#if nextBlockNumber != null}<a href="/block/{nextBlockNumber}">&gt;</a> --- <a href="/block/latest">&gt;&gt;</a> {/if} </h1>

  <!--<h1>Details for block {parseInt(data.block['number'])} </h1>-->
  {#if nextBlockNumber == null}
    <p style="color:blue">Next block will have a base fee of {parseInt(data.nextBaseFee.next)/1e9} gwei, which will be {parseInt(data.nextBaseFee.next)/1e18*21000} ETH for a simple transfer.</p>
  {/if}

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

          {:else if key === 'logsBloom'}
            <td>
              <button on:click={() => showLogsBloom = !showLogsBloom}>
                {showLogsBloom 
                  ? 'Hide logs bloom' 
                  : 'Show logs bloom'}
              </button>

              {#if showLogsBloom}
                <br>
                <code>{value}</code>
              {/if}
            </td>

          {:else if key === 'transactions'}
            <td colspan="2">
              <button on:click={() => showTransactions = !showTransactions}>
                {showTransactions 
                  ? `Hide ${value.length} transaction hashes` 
                  : `Show ${value.length} transaction hashes`}
              </button>

              {#if showTransactions}
              <br>
                <table>
                  <tbody>
                    {#each value as txHash}
                      <tr>
                        <td><a href="/tx/{txHash}"><code>{txHash}</code></a></td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {/if}
            </td>

          {:else if key === 'size'}
            <td>{parseInt(value)} bytes</td>
          
          {:else if key === 'number' || key === 'gasLimit' || key === 'blobGasUsed'}
            <td>{parseInt(value)}</td>
          {:else if key === 'extraData'}
            <td>{hexToAscii(value)}</td>
          {:else if key === 'baseFeePerGas'}
            <td>
              {parseInt(value)/10**9} gwei
                {#if data.baseFeeCheck.valid} <span style="color: green">✅ Base fee is verified</span>
                {:else}
                  <span style="color: red">
                    ❌ Couldn't be verified: predicted value is {parseInt(data.baseFeeCheck.expected)/1e9} gwei
                  </span>
                {/if}
            </td>

          {:else if key === 'timestamp'}

             {:else if key === 'withdrawals'}
            <td>
              <button on:click={() => showWithdrawals = !showWithdrawals}>
                {showWithdrawals 
                  ? `Hide ${value.length} withdrawals` 
                  : `Show ${value.length} withdrawals`}
              </button>

              {#if showWithdrawals}
                <br>
                <table>
                  <tbody>
                    {#each value as withdrawal}
                      <p>
                        {#each Object.entries(withdrawal) as [fieldKey, fieldValue]}
                          {camelToHuman(fieldKey)}: 
                          {#if fieldKey === 'address'}
                            <td><code><a href="/address/{fieldValue}">{fieldValue}</a></code></td>
                          {:else if fieldKey === 'amount'}
                            {parseInt(fieldValue)/1e9}
                          {:else}
                            {parseInt(fieldValue)}
                          {/if}
                          <br>
                        {/each}
                        ----
                      </p>
                    {/each}
                  </tbody>
                </table>
              {/if}


            </td>

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