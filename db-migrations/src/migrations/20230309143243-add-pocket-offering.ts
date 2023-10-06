import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {

    const InfrastructureCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "Infrastructure" });
    const billingtierFree = await db.collection("billingtiers").findOne({ "code": "Standard" });
    // Migration up code here.
    await db.collection("networkofferings").insertOne({
      "network": "pocket",
      "active": true,
      "title": "Standard",
      "description": `Pocket Staking`,
      "recurrence": "monthly",
      "billingCategory": InfrastructureCategory?._id,
      "billingTier": billingtierFree?._id
    }, { session });

  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
