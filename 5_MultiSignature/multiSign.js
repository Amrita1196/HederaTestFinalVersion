/**
 * This script will use Multi Signature
 */
//Import dependencies
const {
    Client,
    PrivateKey,
    Hbar,
    TransferTransaction,
    AccountAllowanceApproveTransaction,
    AccountBalanceQuery, TransactionId }
    = require("@hashgraph/sdk");

//Loading values from environment file
require('dotenv').config({path:'../.env'});

// Account1 ID and PrivateKey ,Here Account1 will work like treasury Account
const treasuryAccount = process.env.ACCOUNT_ID1;
const treasury_PVKEY = PrivateKey.fromString(process.env.ACCOUNT_ID1_PVKEY);

// Account2 ID and PrivateKey
const accountID2 = process.env.ACCOUNT_ID2;
const account2_PVKEY = PrivateKey.fromString(process.env.ACCOUNT_ID2_PVKEY);

// Account3 ID 
const accountID3 = process.env.ACCOUNT_ID3;
//checking env file should not be null otherwise will give error

if (treasuryAccount == null ||
    treasury_PVKEY == null) {
    throw new Error("Environment variables treasuryAccount and treasury_PVKEY must be present");
}

// Create our connection to the Hedera network
const client = Client.forTestnet();
client.setOperator(treasuryAccount, treasury_PVKEY);

// this function is giving Allowance Approve Permission Account2 behalf of Account1
async function accountAllowanceApproveFunc() {
    const sendHbar = new Hbar(20);
    const allowanceTxn = new AccountAllowanceApproveTransaction()
        .approveHbarAllowance(treasuryAccount, accountID2, sendHbar)
        .freezeWith(client);
    const allowanceSign = await allowanceTxn.sign(treasury_PVKEY);
    const allowanceSubmit = await allowanceSign.execute(client);
    const allowanceRx = await allowanceSubmit.getReceipt(client);
    console.log(`- Allowance approval status: ${allowanceRx.status}`);

}


// this function using for Transfer 20HBAR in Account3
async function transferHbarFunc(value) {
    try {
        const sendHbar = new Hbar(value);
        // Account2 performing allowance transfer from account1 to account3
        console.log("Account2 performing allowance transfer on behalf of account1 to account3");

        const allowanceSendTx = await new TransferTransaction()
            .addApprovedHbarTransfer(treasuryAccount, sendHbar.negated())
            .addHbarTransfer(accountID3, sendHbar)
            .setTransactionId(TransactionId.generate(accountID2)) // Spender must generate the TX ID or be the client
            .freezeWith(client);
        const approvedSendSign = await allowanceSendTx.sign(account2_PVKEY);
        const approvedSendSubmit = await approvedSendSign.execute(client);
        const approvedSendRx = await approvedSendSubmit.getReceipt(client);
        return approvedSendRx.status;
    } catch (error) {
        console.info("Failed to transfer Hbar", error.toString());

    }

}


//this function using for checking Balance of TreasuryAccount,Account2,Account3
async function checkAccountBalanceFunc() {
    // Create the query for checking Balance of TreasuryAccount
    const query1 = new AccountBalanceQuery()
        .setAccountId(treasuryAccount);
    const accountBalance = await query1.execute(client);
    console.log(`The current balance of account1 ${treasuryAccount} is ${accountBalance.hbars} HBar`);

    // Create the query for checking Balance of Account2
    const query2 = new AccountBalanceQuery()
        .setAccountId(accountID2);
    const accountBalance2 = await query2.execute(client);
    console.log(`The current balance of account2 ${accountID2} is ${accountBalance2.hbars} HBar`);

    // Create the query for checking Balance of Account3
    const query3 = new AccountBalanceQuery()
        .setAccountId(accountID3);
    const accountBalance3 = await query3.execute(client);
    console.log(`The current balance of account3 ${accountID3} is ${accountBalance3.hbars} HBar`);

}


//main Function
async function main() {
    await accountAllowanceApproveFunc(); // calling function for giving allowance approve permission
    await checkAccountBalanceFunc();    // calling function for check balance of accounts
    let tranferStatus = await transferHbarFunc(20);
    console.log(`Transfer status from Account1 to Account3 ${tranferStatus}`);
    await checkAccountBalanceFunc();   //calling function for agian check balance of accounts
    let tranferStatus1 = await transferHbarFunc(20);  //calling function again, try to transfer 20HBAR in account3
    console.log(`allowance has been used and that the second transaction fails. ${tranferStatus1}`);
}
main();