/**
 * This script use for Unpause then transfer token, after Unpause we will be able to transfer token
 */
//Import dependencies
const {
    TransferTransaction,
    Client,
    TokenUnpauseTransaction,
    Wallet,
    PrivateKey
} = require("@hashgraph/sdk");

//Loading values from environment file
require('dotenv').config({path:'../.env'});

 //Fetching accountID1 and private key from .env file
const myAccountId = process.env.ACCOUNT_ID1;
const myPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID1_PVKEY);

//Fetching accountID3 and private key from .env file
const Account3_Id = process.env.ACCOUNT_ID3;
const Account3_PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID3_PVKEY);

//fetching created TokenID from .env file
const tokenId = process.env.TokenID;

//Account5 as pausekey
const pauseKey=PrivateKey.fromString(process.env.ACCOUNT_ID5_PVKEY);

// checking myAccountId and myPrivateKey from .env file,it should not be null
if (myAccountId == null ||
    myPrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Create connection to the Hedera Testnet
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

//create new wallet name like wallet1 for Account3 
const wallet1 = new Wallet(
    Account3_Id,
    Account3_PrivateKey
);

//this function is using for transfer fungible token
async function transferFT(){
    //Create the transfer transaction
    const transaction1 = await new TransferTransaction()
        .addTokenTransfer(tokenId, client.operatorAccountId, -135)
        .addTokenTransfer(tokenId, wallet1.accountId, 135)
        .freezeWith(client);
    //Sign with the sender account private key
    const signTx1 =  await transaction1.sign(myPrivateKey);
    //Sign with the client operator private key and submit to a Hedera network
    const txResponse1 = await signTx1.execute(client);
    //Request the receipt of the transaction
    const receipt1 = await txResponse1.getReceipt(client);
    //Obtain the transaction consensus status
    const transactionStatus1 = receipt1.status;
    console.log("The transaction consensus status for Account3 " +transactionStatus1.toString());

}
//this function is using for unpause fungible token
async function unpauseFT(){
    const transaction=new TokenUnpauseTransaction()
    .setTokenId(tokenId).freezeWith(client);
    //Sign with the pause key 
    const signTx = await transaction.sign(pauseKey);
    //Submit the transaction to a Hedera network    
    const txResponse = await signTx.execute(client); 
    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);
    //Get the transaction consensus status
    const transactionStatus = receipt.status;
    console.log("The Unpause transaction consensus status " +transactionStatus.toString());
}

//main function
async function main(){
    unpauseFT();
    await new Promise(r => setTimeout(r, 2000));
    //call transferFT func
    transferFT();
}
main();