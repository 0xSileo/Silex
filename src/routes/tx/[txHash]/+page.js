import { getTransactionByHash } from '$lib/utils/utils';

export async function load({ params }) {
    const txHash = params.txHash;
    console.log("ok")
    const tx = await getTransactionByHash(txHash)
    console.log(tx)

    // Return the data to be used in the component
    return {
      tx
    };
}