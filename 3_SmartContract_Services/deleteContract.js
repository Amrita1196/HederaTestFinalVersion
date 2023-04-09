const {
    Client,ContractDeleteTransaction,
    PrivateKey, Hbar,ContractCreateFlow,
    ContractFunctionParameters, ContractCallQuery } =
    require("@hashgraph/sdk");
    require('dotenv').config({path:'../.env'});

// Fetch Account1_id and Account1 private key from .env file
const myAccountId = process.env.ACCOUNT_ID1;
const myPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID1_PVKEY);

let contractCompiled = require("./MyContract.json");
    const bytecode = contractCompiled.bytecode;
let contractId;

const client = Client.forTestnet();

client.setOperator(myAccountId, myPrivateKey);

//-----------------------------------------
async function createContractID(){
//Create the transaction
const contractCreate = new ContractCreateFlow()
    .setGas(100000)
    .setAdminKey(myPrivateKey)
    .setBytecode(bytecode);

//Sign the transaction with the client operator key and submit to a Hedera network
const txResponse = contractCreate.execute(client);

//Get the receipt of the transaction
const receipt = (await txResponse).getReceipt(client);

//Get the new contract ID
contractId = (await receipt).contractId;
        
console.log("The new contract ID is " +contractId);
}

//---------------------------------
async function deleteSmartContract(){ 
   //Create the transaction
  const transaction = await new ContractDeleteTransaction()
  .setContractId(contractId)
  .setTransferAccountId(myAccountId)// required
  .freezeWith(client);
  
  //Sign with the admin key on the contract
  const signTx = await transaction.sign(myPrivateKey)
  
  //Sign the transaction with the client operator's private key and submit to a Hedera network
  const txResponse = await signTx.execute(client);
  
  //Get the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);
  
  //Get the transaction consensus status
  const transactionStatus = receipt.status;
  
  console.log("The contract deletion consensus status is " +transactionStatus.toString());
  
  }


  //-------------------------------------------
  async function printResult(){
    const contractQuery = await new ContractCallQuery()
        //Set the gas for the query
        .setGas(100000)
        //Set the contract ID to return the request for
        .setContractId(contractId)
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
  }

  //---------------------

  async function main(){
    // create contract id
    await createContractID();

    // print result
    await printResult();

    // delete contract
    await deleteSmartContract();
  }

  main();