import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    const networks = await db.collection("networks").find({ _id: { $nin: ["pocket", "lightning", "lightning-connect"] } });
    const InfrastructureCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "Infrastructure" });
    const billingtierFree = await db.collection("billingtiers").findOne({ "code": "Professional" });
    for await (const data of networks) {

      await db.collection("networkofferings").insertOne({
        "network": data._id,
        "active": true,
        "title": "Professional",
        "description": `${data.name} ${data.chain || ''} Dedicated RPC Endpoints`,
        "recurrence": "monthly",
        "items": [],
        "billingCategory": InfrastructureCategory?._id,
        "billingTier": billingtierFree?._id
      }, { session });

    }
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
