import { getTransactionCount, getBalance, getCode, resolveENSFromAddress } from "/src/lib/utils/utils"

export async function load({ params }) {
  const ethAddress = params.ethAddress;

  const [balance, txCount, code, primaryENS] = await Promise.all([
    getBalance(ethAddress),
    getTransactionCount(ethAddress),
    getCode(ethAddress),
    resolveENSFromAddress(ethAddress)
  ]);

  return {
    ethAddress,
    balance,
    txCount,
    code,
    primaryENS
  };
}