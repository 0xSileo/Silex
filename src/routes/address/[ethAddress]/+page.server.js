import { getTransactionCount, getBalance, getCode, resolveENSFromAddress } from "/src/lib/utils/utils"

export async function load({ params }) {
    const ethAddress = params.ethAddress
    const balance = await getBalance(ethAddress)
    const txCount = await getTransactionCount(ethAddress)
    const code = await getCode(ethAddress)
    const primaryENS = await resolveENSFromAddress(ethAddress)

    // Return the data to be used in the component
    return {
      ethAddress,
      balance,
      txCount,
      code,
      primaryENS
    };
}