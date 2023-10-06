import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    await db.collection("billingtiers").insertMany([
      {
        "displayName": "Starter",
        "tierSort": 1,
        "code": "FreeWithCC",
      }
    ], { session });
  });


};
export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
