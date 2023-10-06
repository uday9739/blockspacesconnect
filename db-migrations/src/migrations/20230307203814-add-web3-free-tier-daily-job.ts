import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    const tomorrowStartOfDay = new Date(new Date().setHours(0, 0, 0, 0) + 86400000).getTime();
    await db.collection("taskqueueitems").insertOne({
      "createdOn": new Date(),
      "runDate": tomorrowStartOfDay,
      "type": "FREE_TIER_WEB3_ENDPOINTS_DAILY_CHECK",
      "payload": {},
      "recurrence": "DAILY",
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
