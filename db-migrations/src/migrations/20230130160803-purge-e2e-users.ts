import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("taskqueueitems").insertOne({
      "createdOn": 1666730338594,
      "type": "E2E_PURGE_TEST_USER",
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
    await db.collection("taskqueueitems").findOneAndDelete({ type: "E2E_PURGE_TEST_USER" }, { session });
  });
};
