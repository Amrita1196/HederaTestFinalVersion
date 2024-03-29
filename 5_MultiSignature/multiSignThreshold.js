const {

    Wallet,

    LocalProvider,

    PrivateKey,

    KeyList,

    AccountCreateTransaction,

    Hbar,

    AccountBalanceQuery,

    TransferTransaction,

    ScheduleSignTransaction,

    ScheduleInfoQuery,

    TransactionRecordQuery,

} = require("@hashgraph/sdk");

require('dotenv').config({path:'../.env'});

/**
 * @typedef {import("@hashgraph/sdk").AccountBalance} AccountBalance
 * @typedef {import("@hashgraph/sdk").AccountId} AccountId
 */
async function main() {

    // set up wallet
    if (process.env.ACCOUNT1_ID == null || process.env.ACCOUNT_ID1_PVKEY == null) {

        throw new Error(

            "Environment variables ACCOUNT1_ID, and ACCOUNT1_PVKEY are required."
        );

    }

    const wallet = new Wallet(

        process.env.ACCOUNT1_ID,

        process.env.ACCOUNT_ID1_PVKEY,

        new LocalProvider()

    );

    // generate keys
    const privateKeyList = [];

    const publicKeyList = [];

    for (let i = 0; i < 3; i++) {

        const privateKey = PrivateKey.generate();

        const publicKey = privateKey.publicKey;

        privateKeyList.push(privateKey);

        publicKeyList.push(publicKey);

        console.log(`${i + 1}. public key: ${publicKey.toString()}`);

        console.log(`${i + 1}. private key: ${privateKey.toString()}`);

    }

    const thresholdKey = new KeyList(publicKeyList, 2);

    // create multi-sig account
    let transaction = await new AccountCreateTransaction()

        .setKey(thresholdKey)

        .setInitialBalance(Hbar.fromTinybars(1))

        .setAccountMemo("2-of-3 multi-sig account")

        .freezeWithSigner(wallet);

    transaction = await transaction.signWithSigner(wallet);

    const txAccountCreate = await transaction.executeWithSigner(wallet);

    const txAccountCreateReceipt = await txAccountCreate.getReceiptWithSigner(

        wallet
    );

    const multiSigAccountId = txAccountCreateReceipt.accountId;

    console.log(

        `2-of-3 multi-sig account ID:  ${multiSigAccountId.toString()}`
    );

    await queryBalance(multiSigAccountId, wallet);

    // schedule crypto transfer from multi-sig account to operator account
    const txSchedule = await (

        await (

            await (

                await new TransferTransaction()

                    .addHbarTransfer(multiSigAccountId, Hbar.fromTinybars(-1))

                    .addHbarTransfer(

                        wallet.getAccountId(),

                        Hbar.fromTinybars(1)

                    )

                    .schedule() // create schedule
                    .freezeWithSigner(wallet)

            ).signWithSigner(wallet)

        ).sign(privateKeyList[0])

    ) // add 1. signature
        .executeWithSigner(wallet);

    const txScheduleReceipt = await txSchedule.getReceiptWithSigner(wallet);

    console.log("Schedule status: " + txScheduleReceipt.status.toString());

    const scheduleId = txScheduleReceipt.scheduleId;

    console.log(`Schedule ID:  ${scheduleId.toString()}`);

    const scheduledTxId = txScheduleReceipt.scheduledTransactionId;

    console.log(`Scheduled tx ID:  ${scheduledTxId.toString()}`);

    // add 2. signature
    const txScheduleSign1 = await (

        await (

            await (

                await new ScheduleSignTransaction()

                    .setScheduleId(scheduleId)

                    .freezeWithSigner(wallet)

            ).signWithSigner(wallet)

        ).sign(privateKeyList[1])

    ).executeWithSigner(wallet);

    const txScheduleSign1Receipt = await txScheduleSign1.getReceiptWithSigner(

        wallet
    );

    console.log(

        "1. ScheduleSignTransaction status: " +
            txScheduleSign1Receipt.status.toString()

    );

    await queryBalance(multiSigAccountId, wallet);

    // add 3. signature to trigger scheduled tx
    const txScheduleSign2 = await (

        await (

            await (

                await new ScheduleSignTransaction()

                    .setScheduleId(scheduleId)

                    .freezeWithSigner(wallet)

            ).signWithSigner(wallet)

        ).sign(privateKeyList[2])

    ).executeWithSigner(wallet);

    const txScheduleSign2Receipt = await txScheduleSign2.getReceiptWithSigner(

        wallet
    );

    console.log(

        "2. ScheduleSignTransaction status: " +
            txScheduleSign2Receipt.status.toString()

    );

    await queryBalance(multiSigAccountId, wallet);

    // query schedule
    const scheduleInfo = await new ScheduleInfoQuery()

        .setScheduleId(scheduleId)

        .executeWithSigner(wallet);

    console.log(scheduleInfo);

    // query triggered scheduled tx
    const recordScheduledTx = await new TransactionRecordQuery()

        .setTransactionId(scheduledTxId)

        .executeWithSigner(wallet);

    console.log(recordScheduledTx);

}

/**
 * @param {AccountId} accountId
 * @param {Wallet} wallet
 * @returns {Promise<AccountBalance>}
 */
async function queryBalance(accountId, wallet) {

    const accountBalance = await new AccountBalanceQuery()

        .setAccountId(accountId)

        .executeWithSigner(wallet);

    console.log(

        `Balance of account ${accountId.toString()}: ${accountBalance.hbars.toTinybars().toInt()} tinybar`
    );

    return accountBalance;

}

void main();
