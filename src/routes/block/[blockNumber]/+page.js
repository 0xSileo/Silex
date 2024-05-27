export async function load({ params }) {

  let block;
  let blockNumber;

  if (params.blockNumber == "latest") {
    params.blockNumber = await getBlockNumber()
  }

  console.log(params.blockNumber)
  if (isDecimalUint(params.blockNumber)) {

    blockNumber = parseInt(params.blockNumber)
    block = await getBlockByNumber(blockNumber)

  } else if (isBytes32Hex(params.blockNumber)) {

    let blockHash = params.blockNumber.startsWith("0x") ? params.blockNumber : "0x" + params.blockNumber;
    block = await getBlockByHash(blockHash)
    blockNumber = parseInt(block.number)

  } else {
    throw new Error('Block number not decimal or not hash type');
  }
  const currentBlockNumber = await getBlockNumber()

    // Return the data to be used in the component
    return {
      block,
      blockNumber,
      currentBlockNumber
    };
}

async function getBlockNumber() {
  const method = "eth_blockNumber"
  const params = []

  const currentBlockNumber = await sendRequest(method,params)

  return parseInt(currentBlockNumber)
}

async function getBlockByNumber(blockNumber) {
  const method = "eth_getBlockByNumber"
  const params = [blockNumber,false]

  const block = await sendRequest(method,params)

  return block
}

async function getBlockByHash(blockHash) {
  const method = "eth_getBlockByHash"
  const params = [blockHash,false]

  const block = await sendRequest(method,params)

  return block
}

async function sendRequest(method,params) {
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
      console.log("Response:", data);
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


function isDecimalUint(str) {
  // Define a regular expression to match decimal unsigned integers
  // ^ asserts the start of the string
  // \d+ matches one or more digits
  // $ asserts the end of the string
  const decimalUintRegex = /^\d+$/;

  // Test the string against the regular expression
  return decimalUintRegex.test(str);
}


function isBytes32Hex(str) {
  // Define a regular expression to match a valid bytes32 hexadecimal value
  // ^ asserts the start of the string
  // 0x? makes the "0x" prefix optional
  // [0-9a-fA-F]{64} matches exactly 64 hexadecimal characters
  // $ asserts the end of the string
  const bytes32HexRegex = /^(0x)?[0-9a-fA-F]{64}$/;

  // Test the string against the regular expression
  return bytes32HexRegex.test(str);
}