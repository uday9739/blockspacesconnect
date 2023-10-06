import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    await db.collection("lightningbalances").updateMany(
      { 'amount': { $exists: true } },
      [ { $set: { "onchainAmount.fiatValue": 0 } },
        { $set: { "onchainAmount.currency": "usd" } },
        { $set: { "onchainAmount.btcValue": 0 } },
        { $set: { "onchainAmount.exchangeRate": "$amount.exchangeRate" } },
        { $set: { "offchainAmount.fiatValue":  "$amount.fiatValue" } },
        { $set: { "offchainAmount.currency":  "$amount.currency" } },
        { $set: { "offchainAmount.btcValue":  "$amount.btcValue" } },
        { $set: { "offchainAmount.exchangeRate":  "$amount.exchangeRate" } },
        { $unset: "amount" } ],
      { session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection("lightningbalances").updateMany(
      { 'offchainAmount': { $exists: true } },
      [ { $set: { "amount.fiatValue":  "$offchainAmount.fiatValue" } },
        { $set: { "amount.currency":  "$offchainAmount.currency" } },
        { $set: { "amount.btcValue":  "$offchainAmount.btcValue" } },
        { $set: { "amount.exchangeRate":  "$offchainAmount.exchangeRate" } },
        { $unset: ["onchainAmount", "offchainAmount"] } ],
      { session }
    );
  });
};
