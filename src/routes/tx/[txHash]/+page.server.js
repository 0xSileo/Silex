import { getTransactionByHash, verifyTransactionSignature } from '$lib/utils/utils';

export async function load({ params }) {
    const txHash = params.txHash;
    const tx = await getTransactionByHash(txHash)
    const txVerification = verifyTransactionSignature(tx)

    return {
      tx,
      txVerification
    };
}