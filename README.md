## Author
~ Amrita kumari
github link :https://github.com/Amrita1196/HederaTestFinalVersion.git
# Project name
***
HederaTestFinalVersion
****
# .................script files...............
# Account
## Token_Service
### SmartContract_Services
#### ScheduledTransaction
##### MultiSignature
###### Consensus_Services

## ************Installation commands**************************
npm init
npm install
npm install dotenv

## ************hashgraph commands**************************
npm install @hashgraph/sdk
npm install nodemon --save

## ************web3 installation commands**************************
npm install web3

## ******************************script(js file) run commands*********************************
## .........Account ....................
 step1 : cd 1_Account
 step2 : node account.js

## ............FungibleToken ........................
 step1 : cd 2_Token_Services
 step2 : node createTokenAndSupply.js
 step3 : node transferToken.js
 step4 : node pauseAndTransferToken.js
 step5 : unPauseAndTransferToken.js

## ............SmartContractService...............
 step1 : cd 3_SmartContractService
 step2 : node deploy.js

## ............ScheduledTransaction...............
 step1 : cd 4_ScheduledTransaction
 step2 : node sheduleTxn.js

## ...............MultiSignature ........................
 step1 : cd 5_MultiSignature
 step2 : node multiSign.js

## ..........Consensus_Service ....................
step1 : cd 6_Consensus_Services
step2 : node consensus.js

 
