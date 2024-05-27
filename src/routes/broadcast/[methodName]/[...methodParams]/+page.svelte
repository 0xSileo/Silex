<script>
    export let data;
</script>

<h1>Returned data is:</h1>


<ul>
    {#each Object.entries(data.response.returnedData) as [key, value] (key)}
      <li>{key}: {value}</li>
    {/each}
</ul>
