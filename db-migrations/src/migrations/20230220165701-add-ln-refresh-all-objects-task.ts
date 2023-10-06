import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("taskqueueitems").insertOne({
      "createdOn": new Date(),
      "type": "LIGHTNING_NODE_REFRESH_ALL_OBJECTS",
      "payload": {},
      "recurrence": "HOURLY",
      "attempts": 0,
      "status": "QUEUED",
      "auditTrail": [],
    }, { session });
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
