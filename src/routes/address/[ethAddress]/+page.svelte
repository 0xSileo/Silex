<script>
    export let data;
</script>


<table>
    <thead>
      <tr>
        <th>Key</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
        <ul>
        {#each Object.entries(data) as [key, value] (key)}
        <tr>
          <td>{key}</td>
          <td>{value}</td>
        </tr>
      {/each}
    </tbody>
  </table>
