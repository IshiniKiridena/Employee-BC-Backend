const express = require("express");
const router = express.Router();
const StellarSDK = require("stellar-sdk");

router.post("/addtobc", async (req, res) => {
  const { name, age, place, privatekey } = req.body;

  //get key pair
  const sourceKeyPair = StellarSDK.Keypair.fromSecret(privatekey);
  const sourcePubKey = sourceKeyPair.publicKey();
  const server = new StellarSDK.Server("https://horizon-testnet.stellar.org");

  //loading the account
  const account = await server.loadAccount(sourcePubKey);
  const fee = await server.fetchBaseFee();

  //build the transaction
  const transaction = new StellarSDK.TransactionBuilder(account, {
    fee,
    networkPassphrase: StellarSDK.Networks.TESTNET,
  })
    .addMemo(StellarSDK.Memo.text("Employee Add"))
    .addOperation(
      StellarSDK.Operation.manageData({
        name: "Employee Name",
        value: name,
      })
    )
    .addOperation(
      StellarSDK.Operation.manageData({
        name: "Employee Age",
        value: age,
      })
    )
    .addOperation(
      StellarSDK.Operation.manageData({
        name: "Employee Place",
        value: place,
      })
    )
    .setTimeout(30)
    .build();

  transaction.sign(sourceKeyPair);
  console.log("Transaction XDR : ", transaction.toEnvelope().toXDR("base64"));

  try {
    //send to BC
    const transactionRes = await server.submitTransaction(transaction);
    console.log(JSON.stringify(transactionRes, null, 2));
    console.log("\nData has been added to BC : HASH : ", transactionRes.hash);
    //response with success
    res.status(200).json({
      hash: transactionRes.hash,
    });
  } catch (error) {
    console.error("An error occurred : ", error);
    //response with error
    res.status(500).json({
      message: "Error occurred",
    });
  }
});

module.exports = router;
