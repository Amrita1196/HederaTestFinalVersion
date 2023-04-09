/**
 * This script will use to create 5 new accounts and query the balances and Account Info
 */
//Import dependencies
const {
    Client,
    PrivateKey,
    AccountCreateTransaction,
    AccountBalanceQuery,
    Hbar
  } = require("@hashgraph/sdk");
  
  //Loading values from environment file
  require('dotenv').config({path:'../.env'});
  
  async function main() {
  
    // Hedera testnet account ID and private key from .env file
    const myAccountId = process.env.MYACCOUNT_ID;
    const myPrivateKey = process.env.MYACCOUNT_PVKEY;
  
   // creating connection from hedera network using Testnet
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);
  
    // checking AccountId and AccountPrivateKey from .env file,it should not be null
    if (myAccountId == null ||
       myPrivateKey == null) {
      throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }
  
    //using loop for creating 5 times new Account
    for (let i = 1; i <= 5; i++) {
      //create new Keys for Account
      const newAccountPrivateKey = await PrivateKey.generateED25519Async();
      const newAccountPublicKey = newAccountPrivateKey.publicKey;
  
      //create a new account with 700 hbar starting balance
      const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(new Hbar(700))
        .execute(client);

      // Get the new Account Id
      const getReceipt = await newAccount.getReceipt(client);
      const newAccountId = getReceipt.accountId;
  
      //Print All  account Details on the console
      console.log(`#--------------------------------Account${i} Info------------------------------`);
      console.log(`ACCOUNT_ID${i} = ${newAccountId}`);
      console.log(`ACCOUNT_ID${i}_PVKEY = ${newAccountPrivateKey}`);
      console.log(`ACCOUNT_ID${i}_PBKEY = ${newAccountPublicKey}`);
  
      //verify the account balance   
      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);
  
      //print account balance on the console
      console.log(`The account balance for account ${newAccountId}${i} is ${accountBalance.hbars} HBar`);
      //Account Info
      console.log(`Account Info of ACCOUNT_ID${i} ${JSON.stringify(accountBalance)}`);
      console.log("   ");
    }
  }
  main();