<script>
  import { onMount } from "svelte";

  export let data;

  const blocks = data.blockList;
  const NUMBER_OF_HISTORICAL_BLOCKS = data.NUMBER_OF_HISTORICAL_BLOCKS;

  // Convert hex to decimal
  const blockData = blocks.map(b => ({
    number: parseInt(b.number, 16),
    baseFeePerGas: parseInt(b.baseFeePerGas, 16)/1e9,
    gasUsed: parseInt(b.gasUsed, 16),
    gasLimit: parseInt(b.gasLimit, 16)
  }));

  let plotDivA;
  let plotDivB;

  onMount(async () => {
    // Import dynamically to avoid SSR errors
    const module = await import("plotly.js-dist-min");
    const Plotly = module.default ?? module;

    const baseFeePerGas_trace = {
      x: blockData.map(b => b.number),
      y: blockData.map(b => b.baseFeePerGas),
      type: "scatter",
      mode: "lines+markers",
      name: "Base Fee Per Gas"
    };

    const gasUsedPercentage_trace = {
      x: blockData.map(b => b.number),
      y: blockData.map(b => b.gasUsed / b.gasLimit),
      type: "scatter",
      mode: "lines+markers",
      name: "Base Fee Per Gas"
    };

    console.log(gasUsedPercentage_trace["y"])


    Plotly.newPlot(plotDivA, [baseFeePerGas_trace], {
      title: "Base Fee Per Gas by Block",
      xaxis: { title: "Block Number" },
      yaxis: { title: "Base Fee (wei)" }
    });


    Plotly.newPlot(plotDivB, [gasUsedPercentage_trace], {
      title: "Base Fee Per Gas by Block",
      xaxis: { title: "Block Number" },
      yaxis: { title: "Base Fee (wei)" }
    });

  });
</script>

<h1>Stats on the latest {NUMBER_OF_HISTORICAL_BLOCKS} blocks</h1>

<h2>Base fee per gas</h2>
<div bind:this={plotDivA}></div>

<h2>Gas used / gas limit ratio</h2>
<div bind:this={plotDivB}></div>
