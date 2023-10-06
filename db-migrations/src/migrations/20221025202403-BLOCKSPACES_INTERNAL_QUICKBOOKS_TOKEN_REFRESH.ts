import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("taskqueueitems").insertOne({
      "createdOn": 1666730338594,
      "type": "BLOCKSPACES_INTERNAL_QUICKBOOKS_TOKEN_REFRESH",
      "payload": {},
      "recurrence": "MONTHLY",
      "attempts": 0,
      "status": "QUEUED",
      "auditTrail": [],
    },{ session });
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("taskqueueitems").findOneAndDelete({ type: "BLOCKSPACES_INTERNAL_QUICKBOOKS_TOKEN_REFRESH" }, { session });
  });
};

