<script>
  import { camelToHuman } from '$lib/utils/utils'

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
          <td>{camelToHuman(key)}</td>
          <td>{value}</td>
        </tr>
      {/each}
    </ul>
  </tbody>
</table>
