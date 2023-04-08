/**
 * This script that creates a scheduled transaction to transfer 10 Hbar from Account1 to Account2
 */
const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    PrivateKey,
    Hbar, ScheduleInfoQuery
} = require("@hashgraph/sdk");
    require('dotenv').config();

 //fetching Account1ID and private key from .env file
const myAccountId = process.env.ACCOUNT_ID1;
const myPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID1_PVKEY);

//fetching Account2ID and private key from .env file
const otherAccountId2 = process.env.ACCOUNT_ID2;
const otherPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID2_PVKEY);

// checking myAccountId and myPrivateKey from .env file,it should not be null
if (myAccountId == null ||
    myPrivateKey == null ) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Create our connection to the Hedera Testnet
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

async function main() {

    //Create a transaction to schedule
    const transaction = new TransferTransaction()
        .addHbarTransfer(myAccountId, Hbar.fromTinybars(-20))
        .addHbarTransfer(otherAccountId2, Hbar.fromTinybars(20));

    //Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setScheduleMemo("Scheduled TX!")
        .setAdminKey(myPrivateKey)
        .execute(client);

    //Get the receipt of the transaction
    const receipt = await scheduleTransaction.getReceipt(client);

    //Get the schedule ID
    const scheduleId = receipt.scheduleId;
    console.log("The schedule ID is " +scheduleId);

    //Get the scheduled transaction ID
    const scheduledTxId = receipt.scheduledTransactionId;
    console.log("The scheduled transaction ID is " +scheduledTxId);
    process.exit();
}

main();
