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