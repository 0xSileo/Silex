import { getTransactionCount, getBalance, getCode } from "/src/lib/utils/utils"

export async function load({ params }) {
    const ethAddress = params.ethAddress
    const balance = await getBalance(ethAddress)
    const txCount = await getTransactionCount(ethAddress)
    const code = await getCode(ethAddress)

    // Return the data to be used in the component
    return {
      balance,
      txCount,
      code
    };
}