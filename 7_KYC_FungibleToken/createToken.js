const {
    TokenCreateTransaction,
    Client,
    TokenType,TokenGrantKycTransaction,
    TokenMintTransaction,
    AccountBalanceQuery, PrivateKey, Wallet, TokenSupplyType
} = require("@hashgraph/sdk");
require('dotenv').config({path:'../.env'});
// fetch Account1 and set is as treasury account 
const treasuryId = process.env.ACCOUNT_ID2;
const treasuryKey = PrivateKey.fromString(process.env.ACCOUNT_ID2_PVKEY);
//const pauseKey=PrivateKey.fromString(process.env.Account5_pvKey);
let tokenId;
const kycKey=PrivateKey.fromString(process.env.ACCOUNT_ID2_PVKEY);

if (treasuryId == null || treasuryKey == null ) {
    throw new Error("Environment variables treasuryId and treasuryKey must be present");
}
// Fetch Account2 as supply account 
// const supplyAccountId = process.env.ACCOUNT_ID2;
// const supplyPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID2_PVKEY);

// if (supplyAccountId == null ||
//     supplyPrivateKey == null ) {
//     throw new Error("Environment variables supplyAccountId and suppkyPrivateKey must be present");
// }

// Create our connection to the Hedera network using treasury account or Account1
const client = Client.forTestnet();

client.setOperator(treasuryId, treasuryKey);
//
const adminUser = new Wallet(
    treasuryId,
    treasuryKey
)
async function createFT() {
    //Create the transaction and freeze for manual signing
    const transaction = await new TokenCreateTransaction()
        .setTokenName("Awesome Metaverse Token")
        .setTokenSymbol("AMT")
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setTreasuryAccountId(treasuryId)
        .setInitialSupply(100000)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(100000)
        .setAdminKey(adminUser.publicKey)
        .setKycKey(kycKey)
        .freezeWith(client);

    //Sign the transaction with the client, who is set as admin and treasury account
    const signTx =  await transaction.sign(treasuryKey);
    
    //Submit to a Hedera network
    const txResponse = await signTx.execute(client);
    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the token ID from the receipt
     tokenId = receipt.tokenId;

    console.log("The new token ID is " + tokenId);

    //Create the query
    const balanceQuery = new AccountBalanceQuery()
        .setAccountId(adminUser.accountId);

    //Sign with the client operator private key and submit to a Hedera network
    const tokenBalance = await balanceQuery.execute(client);

    console.log("The balance of the user is: " + tokenBalance.tokens.get(tokenId));
   
}



async function main(){
    await createFT();  
}
main();