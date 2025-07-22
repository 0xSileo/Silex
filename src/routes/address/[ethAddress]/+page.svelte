<script>
    export let data;

  function camelToHuman(camelStr) {
    if (!camelStr) return '';

    const words = camelStr
      .replace(/([A-Z])/g, ' $1')     // insert space before uppercase letters
      .toLowerCase();                 // convert entire string to lowercase

    return words.charAt(0).toUpperCase() + words.slice(1);
  }
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
          <td>{camelToHuman(key)}</td>
          <td>{value}</td>
        </tr>
      {/each}
    </ul>
  </tbody>
</table>
