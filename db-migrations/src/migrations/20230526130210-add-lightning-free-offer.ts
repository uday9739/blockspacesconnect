import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.

    const FreeWithCCTier = await db.collection("billingtiers").findOne({ "code": "FreeWithCC" });
    const MultiWebAppCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "MultiWebApp" });
    const LNC_TRANSACTION_Price = await db.collection("networkprices").findOne({
      network: "lightning",
      isMetered: true,
      billingUsageCode: "LNC_TRANSACTION"
    });

    await db.collection("networkofferings").insertOne({
      "network": "lightning",
      "active": true,
      "title": "Starter",
      "description": `Bitcoin Invoicing & Payments`,
      "recurrence": "monthly",
      "billingCategory": MultiWebAppCategory?._id,
      "billingTier": FreeWithCCTier?._id,
      "items": [{
        "price": LNC_TRANSACTION_Price?._id
      }]
    }, { session });


  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
