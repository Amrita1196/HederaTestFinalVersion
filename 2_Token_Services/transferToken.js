/**
 * this script will do first time transfer after create token
 */
const {
    TransferTransaction,
    Client,
    TokenAssociateTransaction,
    Wallet,
    PrivateKey
} = require("@hashgraph/sdk");
    require('dotenv').config({path:'../.env'});

 // fetching Account1 ID and PrivateKey from .env file
const myAccountId = process.env.ACCOUNT_ID1;
const myPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID1_PVKEY);

// fetching Account3 ID and PrivateKey from .env file
const Account3_Id = process.env.ACCOUNT_ID3;
const Account3_PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID3_PVKEY);

// fetching Account4 ID and PrivateKey from .env file
const Account4_Id = process.env.ACCOUNT_ID4;
const Account4_PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID4_PVKEY);

// fetching tokenId from .env file
const tokenId = process.env.TokenID;

// checking myAccountId and myPrivateKey should not be null
if (myAccountId == null ||
    myPrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Create our connection to the Hedera Testnet
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

//create new wallet1 for Account3
const wallet1 = new Wallet(
    Account3_Id,
    Account3_PrivateKey
);
//create new wallet2 for Account4
const wallet2 = new Wallet(
    Account4_Id,
    Account4_PrivateKey
);

async function main() {

    //  Before an account that is not the treasury for a token can receive or send this specific token ID, the account
    //  must become “associated” with the token.
    let associateOtherWalletTx = await new TokenAssociateTransaction()
        .setAccountId(wallet1.accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(Account3_PrivateKey);
    let associateOtherWalletTx2 = await new TokenAssociateTransaction()
        .setAccountId(wallet2.accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(Account4_PrivateKey);

    //SUBMIT THE TRANSACTION
    let associateOtherWalletTxSubmit = await associateOtherWalletTx.execute(client);
    let associateOtherWalletTxSubmit2 = await associateOtherWalletTx2.execute(client);


    //GET THE RECEIPT OF THE TRANSACTION
    let associateOtherWalletRx = await associateOtherWalletTxSubmit.getReceipt(client);
    let associateOtherWalletRx2 = await associateOtherWalletTxSubmit2.getReceipt(client);


    //LOG THE TRANSACTION STATUS
    console.log(`- Token association with the users account3: ${associateOtherWalletRx.status} \n`);
    console.log(`- Token association with the users account4: ${associateOtherWalletRx2.status} \n`);

    //Create the transfer transaction
    const transaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, client.operatorAccountId, -2525)
        .addTokenTransfer(tokenId, wallet1.accountId, 2525)
        .freezeWith(client);

    const transaction2 = await new TransferTransaction()
        .addTokenTransfer(tokenId, client.operatorAccountId, -2525)
        .addTokenTransfer(tokenId, wallet2.accountId, 2525)
        .freezeWith(client);

    //Sign with the sender account private key
    const signTx =  await transaction.sign(myPrivateKey);
    const signTx2 =  await transaction2.sign(myPrivateKey);

    //Sign with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);
    const txResponse2 = await signTx2.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);
    const receipt2 = await txResponse2.getReceipt(client);

    //Obtain the transaction consensus status
    const transactionStatus = receipt.status;
    const transactionStatus2 = receipt2.status;

    console.log("The transaction consensus status for Account3 " +transactionStatus.toString());
    console.log("The transaction consensus status for Account4 " +transactionStatus2.toString());


    process.exit();
}

main();