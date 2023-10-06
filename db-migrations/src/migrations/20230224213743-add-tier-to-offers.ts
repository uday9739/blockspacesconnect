import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const networkofferingsExists = await db.listCollections({ name: "networkofferings" }).hasNext();
    if (!networkofferingsExists) {
      return;
    }
    const billingtiersExists = await db.listCollections({ name: "billingtiers" }).hasNext();
    if (!billingtiersExists) {
      return;
    }

    const offers = await db.collection("networkofferings").find({ billingTier: { $exists: false }, title: "Standard" });
    const basicTier = await db.collection("billingtiers").findOne({ "code": "Standard" });

    for await (const offer of offers) {
      await db.collection("networkofferings").updateOne({ _id: offer._id },
        {
          $set: {
            "billingTier": basicTier?._id
          },
        },
        { upsert: false }
      );

    }
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};


export interface NetworkOffering {
  title: string;
  billingTier: string
}