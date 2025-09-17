<script>
  export let data;
</script>


<h1>Details for {data.primaryENS ? data.primaryENS : data.ethAddress }</h1>
<p><strong>Address:</strong> {data.ethAddress}</p>
<p><strong>Balance:</strong> {data.balance} ETH</p>
<p><strong>Transaction Count:</strong> {data.txCount}</p>
<p><strong>Code:</strong> {data.code === '0x' ? 'Externally Owned Account' : 'Smart Contract'}</p>

