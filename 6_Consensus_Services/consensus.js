/**
 * This script for consensus 
 */
//Import dependencies
const {
    TopicCreateTransaction,
    Client,
    PrivateKey,
    TopicMessageQuery,
    TopicMessageSubmitTransaction
} = require("@hashgraph/sdk");

//Loading values from environment file
require('dotenv').config({path:'../.env'});

//using Account1 ID and Privatekey for consensus
const myAccountId = process.env.ACCOUNT_ID1;
const myPrivateKey = PrivateKey.fromString(process.env.ACCOUNT_ID1_PVKEY);

// accountId and Private key should be avaialable in our env file
if (myAccountId == null ||
    myPrivateKey == null) {
    throw new Error("Environment variables myAccountId and myPrivateKey must be present");
}

// Create our connection to the Hedera Testnet 
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

//main function
async function main() {
    //Create a new topic
    let txResponse = await new TopicCreateTransaction().execute(client);
    //Get the receipt of the transaction
    let receipt = await txResponse.getReceipt(client);
    // get new topic ID from the receipt
    let topicId = receipt.topicId;
    //Log the topic ID
    console.log(`topic ID is: ${topicId}`);
    // Wait 5 seconds between consensus topic creation and subscription
    await new Promise((resolve) => setTimeout(resolve, 5000));
    // Subscribe to the topic
    new TopicMessageQuery()
        .setTopicId(topicId)
        .subscribe(client, null, (message) => {
            let messageAsString = Buffer.from(message.contents, "utf8").toString();
            console.log(`${message.consensusTimestamp.toDate()} Received: ${messageAsString}`);
        });

    // /Send one message
    let sendResponse = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: `Amrita Here,writing msg when,giving Hedera Test,`,
    }).execute(client);

    //Get the receipt of the transaction
    const getReceipt = await sendResponse.getReceipt(client);

    //Get the status of the transaction  
    const transactionStatus = getReceipt.status;
    console.log("The message transaction status: " + transactionStatus);

}

main();