<script>
  import { onMount } from 'svelte';
  import { camelToHuman, BLOCK_TIME, hexToAscii, refreshBlockData, ZERO_ADDRESS, ZERO_BYTES32 } from '$lib/utils/utils';

  export let data;

  let latestBlockNumber = data.currentBlockNumber;
  let showTransactions = false;
  let showWithdrawals = false;
  let showLogsBloom = false;

  let etaTimestamp;

  async function refreshBlock(newBlockNumber) {
    const newData = await refreshBlockData(newBlockNumber);
    data = { ...data, ...newData }; 
  }

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

        ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.method === "eth_subscription") {
          const newBlockNumber = parseInt(msg.params.result.number, 16);
          if (newBlockNumber > latestBlockNumber) {
            latestBlockNumber = newBlockNumber;

            if (data.requestedLatestBlock) {
              await refreshBlock(newBlockNumber);
            }
          }
        }
        };

        ws.onerror = console.error;
        return () => ws.close();
    });

  $: previousBlockNumber = data.blockNumber > 0 ? data.blockNumber - 1 : null
  $: nextBlockNumber = data.blockNumber + 1 <= latestBlockNumber ? data.blockNumber + 1 : null

  $: blockInTheFuture = data.blockNumber > latestBlockNumber

  $: if (blockInTheFuture) {
    let approximateSecondsDelta = (data.blockNumber - latestBlockNumber)*BLOCK_TIME
    let currentBlockTimestamp = parseInt(data.currentBlock.timestamp)

    etaTimestamp = currentBlockTimestamp + approximateSecondsDelta
  }

  $: if (!blockInTheFuture && !data.block) {
    refreshBlock(data.blockNumber);
  }

</script>

{#if blockInTheFuture}
  <h1>Block {data.blockNumber} is in the future</h1>
  <p>Waiting for it to be mined... Current block is  <a href="/block/{latestBlockNumber}">{latestBlockNumber}</a>. If all slots are filled, the block should be mined on {new Date(etaTimestamp*1000)}</p>
{:else}
  <h1>  {#if previousBlockNumber != null}<a href="/block/{previousBlockNumber}">&lt;</a>{/if}  Details for block {parseInt(data.blockNumber)}  {#if nextBlockNumber != null}<a href="/block/{nextBlockNumber}">&gt;</a> --- <a href="/block/latest">&gt;&gt;</a> {/if} </h1>


  {#if data.blockNumber == 0}
     <p style="color:blue">This is the genesis block which has no parent block, hence why the value of <code>parentHash</code> is zero. Additionnally, other values such as <code>miner</code> and <code>timestamp</code> were initialised as zero. The value of the <code>extraData</code> field is the hash of a block on a testnet, click the link at <code>extraData</code> for more info. This block distributes the initially available Ether following the ICO. More details about the genesis block can be found in <a href="https://blog.ethereum.org/2015/07/27/final-steps">this 2015 blog post</a> on the Ethereum website.</p>
  {/if}

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

          {#if key === 'parentHash' && value !== ZERO_BYTES32}
            <td><code><a href="/block/{value}">{value}</a></code></td>

          {:else if key === 'miner' && value !== ZERO_ADDRESS}
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
          {:else if key === 'gasUsed'}
            <td>{parseInt(value)} ({(parseInt(value)/parseInt(data.block.gasLimit)*100).toFixed(2)} % of gas limit)</td>
          {:else if key === 'extraData'}
            {#if data.blockNumber == 0}
              <td><a href="https://ethereum.stackexchange.com/questions/71804/what-is-the-meaning-of-ethereum-mainnet-genesis-block-extradata-value"><code>{value}</code></a></td>
            {:else}
              <td>{value == "0x" ? "No extra data specified" : hexToAscii(value)}</td>
            {/if}
          {:else if key === 'baseFeePerGas'}
            <td>
              {parseInt(value)/10**9} gwei
              {#if data.baseFeeCheck !== null}
                {#if data.baseFeeCheck.valid} <span style="color: green">✅ Base fee is verified</span>
                {:else}
                  <span style="color: red">
                    ❌ Couldn't be verified: predicted value is {parseInt(data.baseFeeCheck.expected)/1e9} gwei
                  </span>
                {/if}
              {/if}
            </td>

          {:else if (key === 'timestamp' && data.blockNumber != 0)}
              <td>{new Date(parseInt(value) * 1000)}</td>

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

  <h2>
    Block receipts
  </h2>
    {#if data.blockReceipts !== undefined}
      {#each Object.entries(data.blockReceipts) as [key, value] (key)}
        {key}
        <br>
        {value}
      {/each}
    {:else}
      <p>Could not fetch block receipts</p>
    {/if}

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