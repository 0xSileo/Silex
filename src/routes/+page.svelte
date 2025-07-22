<script>
    import { onMount } from 'svelte';

    // Initialising the variable with an http method on load
    export let data;
    let blockNumber = data.currentBlockNumber;

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
            blockNumber = parseInt(msg.params.result.number, 16);
        }
        };

        ws.onerror = console.error;
        return () => ws.close();
    });
</script>

<h1>Latest block is <a href="/block/{blockNumber}">{blockNumber}</a></h1>