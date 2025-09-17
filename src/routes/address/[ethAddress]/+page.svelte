<script>
  import { camelToHuman } from '$lib/utils/utils';

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
          <td>{key == "primaryENS" ? "Primary ENS" : camelToHuman(key)}</td>
          <td>{value}</td>
        </tr>
      {/each}
    </ul>
  </tbody>
</table>


<h1>Address Info</h1>
<p><strong>Address:</strong> {data.primaryENS || data.ethAddress}</p>
<p><strong>Balance:</strong> {data.balance}</p>
<p><strong>Transaction Count:</strong> {data.txCount}</p>
<p><strong>Code:</strong> {data.code === '0x' ? 'Externally Owned Account' : 'Smart Contract'}</p>
