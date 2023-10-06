import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    await db.collection("billingtiers").insertMany([
      {
        "displayName": "Basic",
        "tierSort": 5,
        "code": "Basic",
      },
      {
        "displayName": "Enterprise",
        "tierSort": 40,
        "code": "Enterprise",
      }
    ], { session });
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
