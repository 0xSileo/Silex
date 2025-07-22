import openrpc from '../../../../openrpc.json';
import { sendRequest } from '/src/lib/utils/utils';

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