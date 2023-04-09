const {
    Client,
    FileCreateTransaction,
    ContractCreateTransaction,
    PrivateKey, Hbar,ContractExecuteTransaction,
    ContractFunctionParameters, ContractCallQuery }
     = require("@hashgraph/sdk");
       require('dotenv').config({path:'../.env'});
const Web3=require("web3");
const web3=new Web3;
// Fetch Account1_id and Account1 private key from .env file
const myAccountId = process.env.ACCOUNT_ID1;
const myPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID1_PVKEY);
let bytecodeFileId;
let contractID;
let fun1_output;

// If not able to fetch it, should throw a new error
if (myAccountId == null ||
    myPrivateKey == null) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Create connection to the Hedera network
const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

async function main() {
    let contractCompiled = require("./MyContract.json");
    const bytecode = contractCompiled.bytecode;

    //Create a file on Hedera and store the hex-encoded bytecode
    const fileCreateTx = new FileCreateTransaction()

        //Set the bytecode of the contract
        .setContents(bytecode);

    //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
    const submitTx = await fileCreateTx.execute(client);

    //Get the receipt of the file create transaction
    const fileReceipt = await submitTx.getReceipt(client);

    //Get the file ID from the receipt
    bytecodeFileId = fileReceipt.fileId;

    //Log the file ID
    console.log("The smart contract byte code file ID is " + bytecodeFileId)

    // call createContractId function to set the bytecodeFileId to Hedera test network & obtain contractID
     createContractId();

    await new Promise(r => setTimeout(r, 2000));
    // call printFunction1 to get the result
     fun1_output= await printFunction1();

    await new Promise(r => setTimeout(r, 2000));
    // call printFunction1 to get the result
    printFunction2(fun1_output);
    await new Promise(r => setTimeout(r, 2000));
    // call abiDecodeTxn function
    abiDecodeTxn();



}

async function createContractId() {
    console.log("################### Calling createContractId function #######################################");
    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
        //Set the file ID of the Hedera file storing the bytecode
        .setBytecodeFileId(bytecodeFileId)
        //Set the gas to instantiate the contract
        .setGas(100000);

    //Submit the transaction to the Hedera test network
    const contractResponse = await contractTx.execute(client);

    //Get the receipt of the file create transaction
    const contractReceipt = await contractResponse.getReceipt(client);

    //Get the smart contract ID
     contractID = contractReceipt.contractId;

    //Log the smart contract ID
    console.log("The smart contract ID is " + contractID);

}
async function printFunction1() {
    console.info("################################### Calling Smart Contract Function1 #############################");
    const contractQuery = await new ContractCallQuery()
        //Set the gas for the query
        .setGas(100000)
        //Set the contract ID to return the request for
        .setContractId(contractID)
        //Set the contract function to call
        .setFunction("addNumbers", new ContractFunctionParameters().addUint16(6).addUint16(7))
        //Set the query payment for the node returning the request
        .setQueryPayment(new Hbar(2));

    //Submit to a Hedera network
    const getResult = await contractQuery.execute(client);

    // Get the result at index 0
    const result = getResult.getUint256(0);

    //Log the result
    console.log(" function1 output : " + result);
    return result;
}
async function printFunction2() {
    console.info("################################### Calling Smart Contract Function2 #############################");
    const contractQuery2 = await new ContractCallQuery()
        //Set the gas for the query
        .setGas(100000)
        //Set the contract ID to return the request for
        .setContractId(contractID)
        //Set the contract function to call
        .setFunction("multiplyByTwo", new ContractFunctionParameters().addUint16(5))
        //Set the query payment for the node returning the request
        .setQueryPayment(new Hbar(2));

    //Submit to a Hedera network
    const getResult2 = await contractQuery2.execute(client);

    // Get the result at index 0
    const result2 = getResult2.getUint256(0);

    //Log the message
    console.log(" function2 output : " + result2);
}
async function abiDecodeTxn() {
    console.info("################################### abiDecodeTxn function #############################");
    //Create the transaction to update the contract message
    const contractExecTx = await new ContractExecuteTransaction()
        //Set the ID of the contract
        .setContractId(contractID)
        //Set the gas for the contract call
        .setGas(100000)
        //Set the contract function to call
        .setFunction("eventFun", new ContractFunctionParameters().addUint16(3).addUint16(2));

    //Submit the transaction to a Hedera network and store the response
    const submitExecTx = await contractExecTx.execute(client);

    //Get the receipt of the transaction
    const receipt = await submitExecTx.getReceipt(client);

    //Confirm the transaction was executed successfully
    console.log("The transaction status is " + receipt.status.toString());

    // get events record for this transaction
    const record = await submitExecTx.getRecord(client);

    // the events are in record.contractFunctionResult.logs.data & parse it using web3.js

    record.contractFunctionResult.logs.forEach(log => {
        // convert the log.data (uint8Array) to a string
        let logStringHex = '0x'.concat(Buffer.from(log.data).toString('hex'));

        // get topics from log
        let logTopics = [];
        log.topics.forEach(topic => {
            logTopics.push('0x'.concat(Buffer.from(topic).toString('hex')));
        });

        // decode the event data
        decodeEvent("NumberAdded", logStringHex, logTopics.slice(1));
    });
}
// decode the event using decodeEvent function
function decodeEvent(eventName, log, topics) {
    const abiFile = require("./MyContract.json");
    abi = abiFile.abi;
    const eventAbi = abi.find(event => (event.name === eventName && event.type === "event"));
    const decodedLog = web3.eth.abi.decodeLog(eventAbi.inputs, log, topics);
    console.log(decodedLog);
    return decodedLog;
}
main();
