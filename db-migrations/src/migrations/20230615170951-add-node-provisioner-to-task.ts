import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    const nextHour = new Date();
    nextHour.setSeconds(0);
    nextHour.setMinutes(0);
    nextHour.setMilliseconds(0);
    nextHour.setHours(nextHour.getHours() + 1);
    await db.collection("taskqueueitems").insertOne({
      "createdOn": new Date(),
      "runDate": nextHour,
      "type": 'CHECK_PROVISION_NODES',
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
