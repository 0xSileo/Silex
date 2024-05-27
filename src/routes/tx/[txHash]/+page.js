export async function load({ params }) {
    const txHash = params.txHash;
    const tx = await getTransactionByHash(txHash)
    console.log(tx)

    // Return the data to be used in the component
    return {
      tx
    };
}

async function getTransactionByHash(txHash) {
  const method = "eth_getTransactionByHash"
  const params = [txHash]

  const returnedData = await sendRequest(method,params)
  console.log(returnedData)

  return returnedData
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