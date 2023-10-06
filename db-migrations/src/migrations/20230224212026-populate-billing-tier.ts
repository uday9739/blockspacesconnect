import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const importCollectionExists = await db.listCollections({ name: "billingtiers" }).hasNext();
    if (!importCollectionExists) {
      await db.createCollection("billingtiers");
    }
    await db.collection("billingtiers").insertMany([
      {
        "displayName": "Free",
        "tierSort": 0,
        "code": "Free",
      },
      {
        "displayName": "Standard",
        "tierSort": 20,
        "code": "Standard",
      }
    ], { session });
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("billingtier").drop();
  });
};
