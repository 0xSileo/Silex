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

async function getBalance(ethAddress) {
  const method = "eth_getBalance"
  const params = [ethAddress,"latest"]

  const returnedData = await sendRequest(method,params)
  const balance = parseInt(returnedData)/ 10**18

  return balance
}

async function getCode(ethAddress) {
  const method = "eth_getCode"
  const params = [ethAddress,"latest"]

  const returnedData = await sendRequest(method,params)
  const code = returnedData

  return code
}


async function getTransactionCount(ethAddress) {
  const method = "eth_getTransactionCount"
  const params = [ethAddress,"latest"]

  const returnedData = await sendRequest(method,params)
  const txCount = parseInt(returnedData)

  return txCount
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
        console.log("Response result", data.result)
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