import { getBlockNumber, isDecimalUint, isBytes32Hex, getBlockByNumber, getBlockByHash, verifyBaseFeeEIP1559, nextEIP1559BaseFee, getBlockReceipts } from "/src/lib/utils/utils";

export async function load({ params }) {

  let block;
  let blockNumber;
  let requestedLatestBlock = false;

  // Blocks can be fetched by specifying

  // 1. "latest" : Handle case where url is /block/latest
  if (params.blockNumber == "latest") {
    params.blockNumber = await getBlockNumber();
    requestedLatestBlock = true;
  }

  // 2. The block number : Check & handle case of uint
  if (isDecimalUint(params.blockNumber)) {

    blockNumber = parseInt(params.blockNumber)
    block = await getBlockByNumber(blockNumber)

  // 3. The block hash : Check & handle case of 32 hex bytes (blockhash)
  } else if (isBytes32Hex(params.blockNumber)) {
    
    // TODO Error handling if it's an inexistent hash
    let blockHash = params.blockNumber.startsWith("0x") ? params.blockNumber : "0x" + params.blockNumber;

    block = await getBlockByHash(blockHash)
    blockNumber = parseInt(block.number)

  } else {
    throw new Error("Invalid block reference given. User has a 500 page now");
  }

  const currentBlockNumber = await getBlockNumber();
  const currentBlock = await getBlockByNumber(currentBlockNumber)

  // Fetch the parent block if not genesis
  let baseFeeCheck = null;
  let nextBaseFee = null;
  let blockReceipts = null;
  if (blockNumber > 0 && blockNumber <= currentBlockNumber ) {
    const parentBlock = await getBlockByNumber(blockNumber - 1);
    baseFeeCheck = verifyBaseFeeEIP1559(parentBlock, block);
    nextBaseFee = nextEIP1559BaseFee(block)
    
    blockReceipts = await getBlockReceipts(blockNumber)
  }

  return {
    block,
    blockNumber,
    currentBlockNumber,
    currentBlock,
    requestedLatestBlock,
    baseFeeCheck,
    nextBaseFee
  };
}
