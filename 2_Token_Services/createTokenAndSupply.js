/**
 * This script will use for create Token,Additoinal Supply with Account2
 */
const {
    TokenCreateTransaction,
    Client,
    TokenType,
    TokenMintTransaction,
    AccountBalanceQuery, PrivateKey, Wallet, TokenSupplyType
} = require("@hashgraph/sdk");

//Loading values from environment file
require('dotenv').config();

// Configure Account1 as treasury account 
const treasuryId = process.env.ACCOUNT_ID1;
const treasuryKey = PrivateKey.fromString(process.env.ACCOUNT_ID1_PVKEY);

// Account5 as Pause Key
const pauseKey = PrivateKey.fromString(process.env.ACCOUNT_ID5_PVKEY);

// checking treasuryId and treasuryKey from .env file,it should not be null
if (treasuryId == null || treasuryKey == null) {
    throw new Error("Environment variables treasuryId and treasuryKey must be present");
}
// Configure Account2 as supply account 
const supplyAccountId = process.env.ACCOUNT_ID2;
const supplyPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID2_PVKEY);

// checking supplyAccountId and supplyPrivateKey from .env file,it should not be null
if (supplyAccountId == null ||
    supplyPrivateKey == null) {
    throw new Error("Environment variables supplyAccountId and supplyPrivateKey must be present");
}

// Create our connection to the Hedera network using treasury account or Account1
const client = Client.forTestnet();
client.setOperator(treasuryId, treasuryKey);

//creating new wallet for adminUser
const adminUser = new Wallet(
    treasuryId,
    treasuryKey
)
//creating new wallet for supplyUser
const supplyUser = new Wallet(
    supplyAccountId,
    supplyPrivateKey
)

//this function is using for create Token
async function createToken() {
    //Create the transaction and freeze for manual signing
    const transaction = await new TokenCreateTransaction()
        .setTokenName("EclipseToken")
        .setTokenSymbol("EPT")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setTreasuryAccountId(treasuryId)
        .setInitialSupply(35050)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(50000)
        .setAdminKey(adminUser.publicKey)
        .setSupplyKey(supplyUser.publicKey)
        .setPauseKey(pauseKey)
        .freezeWith(client);

    //Sign the transaction with the client, who is set as admin and treasury account
    const signTx = await transaction.sign(treasuryKey);

    //Submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the token ID from the receipt
    const tokenId = receipt.tokenId;
    console.log("The new token ID is " + tokenId);

    //Create the query
    const balanceQuery = new AccountBalanceQuery()
        .setAccountId(adminUser.accountId);

    //Sign with the client operator private key and submit to a Hedera network
    const tokenBalance = await balanceQuery.execute(client);

    console.log("The balance of the user is: " + tokenBalance.tokens.get(tokenId));
    console.log("----------------supply_increase---------------------------");
    addtionalSupply(tokenId);
}


createToken();


async function addtionalSupply(tokenId) {
    //Create the transaction and freeze for manual signing
    const transaction = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(14950)
        .freezeWith(client);

    //Sign the transaction with the client, who is set as admin and treasury account
    const signTx = await transaction.sign(supplyPrivateKey);

    //Submit the signed transaction to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status.toString();

    console.log("The transaction consensus status is " + transactionStatus);
    const balanceQuery = new AccountBalanceQuery()
        .setAccountId(adminUser.accountId);

    const tokenBalance = await balanceQuery.execute(client);

    console.log("The balance of the user after increase supply is: " + tokenBalance.tokens.get(tokenId));
}