import openrpc from '../../../../openrpc.json';

export async function load({ params }) {

    const methodName = params.methodName;
    const methodDetails = openrpc.methods.find(method => method.name === methodName);
    const isValid = methodDetails !== undefined

    if (isValid) {
        //TODO : Maybe just use the node's response
        const methodParamsString = params.methodParams;
        const methodParams = methodParamsString.split("/");

        const meetsRequiredParamCount = methodParams.length === methodDetails.params.filter(param => param.required).length

        if (meetsRequiredParamCount) {

             //TODO parse methodParams according to methodDetails

            console.log("Method",methodName, "with params:",methodParams)
            console.log("Details of the Method", methodDetails)

            methodDetails.params.forEach((param) => {
                console.log(param.schema)
                console.log(param.schema.oneOf?.[0].type || param.schema.type)
            }
            );

            const returnedData = await sendRequest(methodName,methodParams);
            
            return {
                response: { returnedData },
            };

        } else {
            //TODO handle optional params
            // If 2 reqs and 1+ optional, submitting 1required and 1optional wouldn't trigger this
            // Which is WRONG
            console.log("The specified number of parameters is incorrect")
        }

       
    } else {
        console.log("Method not present in the Ethereum JSON RPC specification. See the list here : https://ethereum.github.io/execution-apis/api-documentation/")
    }
}


function validateParams(paramObj,methodParams) {
    methodParams.forEach((givenParam) => {
        
    })
}




function retreiveType(paramObj) {
    console.log(paramObj)
    let paramTypes = []
    if ('anyOf' in paramObj.schema) {
        paramObj.schema.anyOf.forEach((poss) => paramTypes.push(poss))
    } else {
        paramTypes.push(paramObj.schema.type)
    }
    console.log(paramTypes)
}


async function sendRequest(methodName, methodParams) {
    const jsonRpcRequest = {
      jsonrpc: "2.0",
      method: methodName,
      params: methodParams,
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
        return data; // Return the data from the function
      } else {
        console.error("Error:", response.statusText);
        return null; // Handle error case appropriately
      }
    } catch (error) {
      console.error("Error:", error.message);
      return null; // Handle error case appropriately
    }
  }