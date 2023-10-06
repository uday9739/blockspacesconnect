import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const data = await db.collection("networkpricebillingcategories").findOne({ name: "Lightning" });

    db.collection<schema>("networkofferings").updateMany({ billingCategory: { $exists: false } }, { $set: { billingCategory: data?._id } }, { upsert: false});
    db.collection<schema>("networkprices").updateMany({ billingCategory: { $exists: false } }, { $set: { billingCategory: data?._id } }, { upsert: false});

  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
type schema = {
  billingCategory?: object;
};
