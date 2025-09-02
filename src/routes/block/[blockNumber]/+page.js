import { getBlockNumber, isDecimalUint, isBytes32Hex, getBlockByNumber, getBlockByHash } from "/src/lib/utils/utils";

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

  // Fetch the parent block if not genesis
  let baseFeeCheck = null;
  let nextBaseFee = null;
  if (blockNumber > 0) {
    const parentBlock = await getBlockByNumber(blockNumber - 1);
    baseFeeCheck = verifyBaseFeeEIP1559(parentBlock, block);
    nextBaseFee = nextEIP1559BaseFee(block)
  }

  return {
    block,
    blockNumber,
    currentBlockNumber,
    requestedLatestBlock,
    baseFeeCheck,
    nextBaseFee
  };
}

function toBigInt(value) {
  // Handle both decimal and hex strings
  if (typeof value === "string") {
    if (value.startsWith("0x")) {
      return BigInt(value);
    } else {
      return BigInt(parseInt(value));
    }
  }
  return BigInt(value); // for numbers or already BigInt
}

// Helper: EIP-1559 base fee verification
function verifyBaseFeeEIP1559(parent, child) {
  if (!parent.baseFeePerGas || !child.baseFeePerGas) {
    return {
      valid: false,
      reason: "Missing base fee (possibly pre-EIP-1559 block?)"
    };
  }

  const parentBaseFee = toBigInt(parent.baseFeePerGas);
  const parentGasUsed = toBigInt(parent.gasUsed);
  const parentGasLimit = toBigInt(parent.gasLimit);
  const childBaseFee = toBigInt(child.baseFeePerGas);

  const targetGas = parentGasLimit / 2n;
  const BASE_FEE_MAX_CHANGE_DENOMINATOR = 8n;

  let expectedBaseFee;

  if (parentGasUsed === targetGas) {
    expectedBaseFee = parentBaseFee;
  } else if (parentGasUsed > targetGas) {
    const gasDelta = parentGasUsed - targetGas;
    let delta = (parentBaseFee * gasDelta) / targetGas / BASE_FEE_MAX_CHANGE_DENOMINATOR;
    if (delta < 1n) delta = 1n; // minimum increase of 1 wei
    expectedBaseFee = parentBaseFee + delta;
  } else {
    const gasDelta = targetGas - parentGasUsed;
    let delta = (parentBaseFee * gasDelta) / targetGas / BASE_FEE_MAX_CHANGE_DENOMINATOR;
    expectedBaseFee = parentBaseFee - delta;
  }

  return {
    valid: expectedBaseFee === childBaseFee,
    expected: expectedBaseFee.toString(),
    actual: childBaseFee.toString(),
    parentBaseFee: parentBaseFee.toString(),
    parentGasUsed: parentGasUsed.toString(),
    parentGasLimit: parentGasLimit.toString(),
    targetGas: targetGas.toString()
  };
}


// EIP-1559 base fee calculation for next block
function nextEIP1559BaseFee(parent) {
  if (!parent.baseFeePerGas) {
    return {
      valid: false,
      reason: "Missing base fee (possibly pre-EIP-1559 block?)"
    };
  }

  const parentBaseFee = toBigInt(parent.baseFeePerGas);
  const parentGasUsed = toBigInt(parent.gasUsed);
  const parentGasLimit = toBigInt(parent.gasLimit);

  const targetGas = parentGasLimit / 2n;
  const BASE_FEE_MAX_CHANGE_DENOMINATOR = 8n;

  let expectedBaseFee;

  if (parentGasUsed === targetGas) {
    expectedBaseFee = parentBaseFee;
  } else if (parentGasUsed > targetGas) {
    const gasDelta = parentGasUsed - targetGas;
    let delta = (parentBaseFee * gasDelta) / targetGas / BASE_FEE_MAX_CHANGE_DENOMINATOR;
    if (delta < 1n) delta = 1n; // minimum increase of 1 wei
    expectedBaseFee = parentBaseFee + delta;
  } else {
    const gasDelta = targetGas - parentGasUsed;
    let delta = (parentBaseFee * gasDelta) / targetGas / BASE_FEE_MAX_CHANGE_DENOMINATOR;
    expectedBaseFee = parentBaseFee - delta;
  }

  return {
    next: expectedBaseFee.toString()
  };
}
