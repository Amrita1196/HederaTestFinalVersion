// Import dependencies
const {
    TransferTransaction,
    TokenAssociateTransaction, TokenPauseTransaction,
    TokenUnpauseTransaction,
    AccountBalanceQuery,TokenGrantKycTransaction
} = require("@hashgraph/sdk");
    require('dotenv').config({path:'../.env'});

//Define tokenAssociateWithAccount() function to associate accounts
module.exports.tokenAssociateWithAccount = async function (wallet, pvKey, tokenId, client) {
    try {
        // Associate account Id with token Id
        let associateOtherWalletTx = await new TokenAssociateTransaction()
            .setAccountId(wallet.accountId)
            .setTokenIds([tokenId])
            .freezeWith(client)
            .sign(pvKey);

        //Submit to Hedera network
        let associateOtherWalletTxSubmit = await associateOtherWalletTx.execute(client);

        //Get the receipt of the transaction
        let associateOtherWalletRx = await associateOtherWalletTxSubmit.getReceipt(client);

        return associateOtherWalletRx.status;
    }
    // Identify errors when the status is unsuccessful
    catch (error) {
        console.info(`Fail to associate account:${error}`);
    }

}

//Define tokenTransferToAccount() function to transfer tokens
module.exports.tokenTransferToAccount = async function (wallet, tokenAmount, treasuryKey, tokenId, client) {
    try {
        //Create the transfer transaction
        const transaction = await new TransferTransaction()
            .addTokenTransfer(tokenId, client.operatorAccountId, -tokenAmount)
            .addTokenTransfer(tokenId, wallet.accountId, tokenAmount)
            .freezeWith(client);
        //Sign with the sender account private key
        const signTx = await transaction.sign(treasuryKey);
        //Sign with the client operator private key and submit to a Hedera network
        const txResponse = await signTx.execute(client);
        //Request the receipt of the transaction
        const receipt = await txResponse.getReceipt(client);
        //Obtain the transaction consensus status
        const transactionStatus = receipt.status;

        return transactionStatus;
    }
    // Identify errors when the status is unsuccessful
    catch (error) {
        console.info(`Fail to transfer token ${error}`);
    }


}

// Define pauseFT() function to pause token Id
module.exports.pauseFT = async function (tokenId, pauseKey, client) {
    try {
        const transaction = new TokenPauseTransaction()
            .setTokenId(tokenId).freezeWith(client);
        //Sign with the pause key 
        const signTx = await transaction.sign(pauseKey);
        //Submit the transaction to a Hedera network    
        const txResponse = await signTx.execute(client);
        //Request the receipt of the transaction
        const receipt = await txResponse.getReceipt(client);
        //Get the transaction consensus status
        const transactionStatus = receipt.status;
        
        return transactionStatus;
    }
    // Identify errors when the status is unsuccessful
    catch (error) {
        console.info(`Fail to Pause token: ${error}`);
    }


}

// Define unpauseFT() function to unpause token Id
module.exports.unpauseFT = async function (tokenId, pauseKey, client) {
    try {
        const transaction = new TokenUnpauseTransaction()
            .setTokenId(tokenId).freezeWith(client);
        //Sign with the pause key 
        const signTx = await transaction.sign(pauseKey);
        //Submit the transaction to a Hedera network    
        const txResponse = await signTx.execute(client);
        //Request the receipt of the transaction
        const receipt = await txResponse.getReceipt(client);
        //Get the transaction consensus status
        const transactionStatus = receipt.status;
        
        return transactionStatus;
    }
    // Identify errors when the status is unsuccessful
    catch (error) {
        console.info(`Fail to unpause token:${error}`);
    }
}

//Define balaceTokenQuery() functon to examine token balance
module.exports.balaceTokenQuery = async function (wallet, client, tokenId) {

    //Create the query
    const balanceQuery = new AccountBalanceQuery()
        .setAccountId(wallet.accountId);

    //Sign with the client operator private key and submit to a Hedera network
    const tokenBalance = await balanceQuery.execute(client);

    console.log(`The token balance of the user be owned by AccountId ${wallet.accountId} is: ` + tokenBalance.tokens.get(tokenId));
}

module.exports.enableKYConAccount=async function (wallet,kycKey,tokenId,client){
    try{//Enable KYC flag on account and freeze the transaction for manual signing
const transaction = await new TokenGrantKycTransaction()
.setAccountId(wallet.accountId)
.setTokenId(tokenId)
.freezeWith(client);

//Sign with the kyc private key of the token
const signTx = await transaction.sign(kycKey);

//Submit the transaction to a Hedera network    
const txResponse = await signTx.execute(client);

//Request the receipt of the transaction
const receipt = await txResponse.getReceipt(client);

//Get the transaction consensus status
const transactionStatus = receipt.status;

//console.log("The transaction consensus status " +transactionStatus.toString());
return transactionStatus;
    }
    catch(error){
        console.info(`Fail to enable kyc flag :${error}`);
    }
}