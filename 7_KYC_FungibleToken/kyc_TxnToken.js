/* Description: This script will use to Associate,Transfer,Examine, Pause and
 * Unpause the FT.
 */
// Import dependencies
const {
    Client,
    Wallet,
    PrivateKey
} = require("@hashgraph/sdk");
require('dotenv').config({path:'../.env'});

// Import utils file
const utils = require('./utils.js');

// Fetch Account1 Id & private key and put down it as treasury account 
const treasuryId = process.env.ACCOUNT_ID2;
const treasuryKey = PrivateKey.fromString(process.env.ACCOUNT_ID2_PVKEY);

// Fetch Account3 Id and private key
const Account3_Id = process.env.ACCOUNT_ID3;
const Account3_PrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID3_PVKEY);

const tokenId=process.env.KYC_TokenID;
const kycKey=PrivateKey.fromString(process.env.ACCOUNT_ID2_PVKEY);
// Validating treasuryId and treasuryKey for null value
if (treasuryId == null || treasuryKey == null) {
    throw new Error("Environment variables treasuryId and treasuryKey must be present");
}

// Validating Account3_Id and Account3_PrivateKey for null value
if (Account3_Id == null || Account3_PrivateKey == null) {
    throw new Error("Environment variables Account3_Id and Account3_PrivateKey must be present");
}

// Create connection to the Hedera network
const client = Client.forTestnet();
client.setOperator(treasuryId, treasuryKey);

const adminUser = new Wallet(
    treasuryId,
    treasuryKey
)

// Create wallet3 using Account3_Id & Account3_PrivateKey
const wallet3 = new Wallet(
    Account3_Id,
    Account3_PrivateKey
);

// Define main function to call other requisite functions utilizing imported utils file 
async function main() {
    console.log('########################## Associate Accounts ################################');
    // Associate wallet3 using tokenAssociateWithAccount() function
    let account3_Assosiate_status = await utils.tokenAssociateWithAccount(wallet3, Account3_PrivateKey, tokenId, client);
    console.log(`Account3 associate status :${account3_Assosiate_status}`);


    console.log('########## QueryTokenBalance of Accounts before transfer of tokens ################');
    // Examine the token balance of accounts before token transfer
    await utils.balaceTokenQuery(wallet3, client, tokenId);

    console.log('########################## Transfer tokens to Accounts ########################');
    // transfer token to wallet3 using tokenTransferToAccount() function
    let account3_Txn_status = await utils.tokenTransferToAccount(wallet3, 1299, treasuryKey, tokenId, client);
    console.log(`Account3 transaction status :${account3_Txn_status}`);
    

    console.log('########################## Enable kyc flag on account ########################');
    // Set the KYC flag on Account3
    let kycStatus=await utils.enableKYConAccount(wallet3,kycKey,tokenId,client);
    console.log(`Account3 kyc enable status :${kycStatus}`);
    
    console.log('########################## Transfer tokens to Accounts ########################');
    // transfer token to wallet3 using tokenTransferToAccount() function
    let account3_Txn_status1 = await utils.tokenTransferToAccount(wallet3, 5, treasuryKey, tokenId, client);
    console.log(`Account3 transaction status :${account3_Txn_status1}`);

    console.log('########## QueryTokenBalance of Accounts after transfer of tokens ################');
    // Examine the token balance of accounts before token transfer
    await utils.balaceTokenQuery(wallet3, client, tokenId);
    
}
// Call the main() function to execute program
main();