export const BLOCK_TIME = 12; // seconds

export function isDecimalUint(str) {
  // Define a regular expression to match decimal unsigned integers
  // ^ asserts the start of the string
  // \d+ matches one or more digits
  // $ asserts the end of the string
  const decimalUintRegex = /^\d+$/;

  // Test the string against the regular expression
  return decimalUintRegex.test(str);
}

export function isBytes32Hex(str) {
  // Define a regular expression to match a valid bytes32 hexadecimal value
  // ^ asserts the start of the string
  // 0x? makes the "0x" prefix optional
  // [0-9a-fA-F]{64} matches exactly 64 hexadecimal characters
  // $ asserts the end of the string
  const bytes32HexRegex = /^(0x)?[0-9a-fA-F]{64}$/;

  // Test the string against the regular expression
  return bytes32HexRegex.test(str);
}

export function camelToHuman(camelStr) {
  if (!camelStr) return '';

  const words = camelStr
    .replace(/([A-Z])/g, ' $1')     // insert space before uppercase letters
    .toLowerCase();                 // convert entire string to lowercase
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export async function getBlockByNumber(blockNumber) {
  const method = "eth_getBlockByNumber"
  const params = [blockNumber,false]
  const block = await sendRequest(method,params)

  return block
}

export async function getBlockByHash(blockHash) {
  const method = "eth_getBlockByHash"
  const params = [blockHash,false]
  const block = await sendRequest(method,params)

  return block
}

export async function getTransactionCount(ethAddress) {
  const method = "eth_getTransactionCount"
  const params = [ethAddress,"latest"]

  const returnedData = await sendRequest(method,params)
  const txCount = parseInt(returnedData)

  return txCount
}

export async function getTransactionByHash(txHash) {
  const method = "eth_getTransactionByHash"
  const params = [txHash]

  const returnedData = await sendRequest(method,params)
  console.log(returnedData)

  return returnedData
}

export async function getBalance(ethAddress) {
  const method = "eth_getBalance"
  const params = [ethAddress,"latest"]

  const returnedData = await sendRequest(method,params)
  const balance = parseInt(returnedData)/ 10**18

  return balance
}

export async function getBlockNumber() {
  const method = "eth_blockNumber"
  const params = []
  const currentBlockNumber = await sendRequest(method,params)

  return parseInt(currentBlockNumber)
}

export async function getCode(ethAddress) {
  const method = "eth_getCode"
  const params = [ethAddress,"latest"]

  const returnedData = await sendRequest(method,params)
  const code = returnedData

  return code
}

export async function sendRequest(method,params) {
  const jsonRpcRequest = {
    jsonrpc: "2.0",
    method: method,
    params: params,
    id: 2,
  };

  try {
    const response = await fetch("http://127.0.0.1:8545", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonRpcRequest),
    });

    if (response.ok) {
      const data = await response.json();
      //console.log("Response:", data);
      return data.result; // Return the data from the function
    } else {
      console.error("Error:", response.statusText);
      return null; // Handle error case appropriately
    }
  } catch (error) {
    console.error("Error:", error.message);
    return null; // Handle error case appropriately
  }
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
export function verifyBaseFeeEIP1559(parent, child) {
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
export function nextEIP1559BaseFee(parent) {
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