import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

/* this migration is doing more than one dbAction */
export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session) => {
    await db.collection("migrationTesting").updateOne({ id: "testId" }, { $set: {accessToken: "Updated-AccessToken"} }, {session} );
    await db.collection("migrationTesting").updateOne({ id: "testId" }, { $set: { migratedUser: true } }, {session});
    await db.collection("migrationTesting").updateOne({ id: "testId" }, { $set: {viewedWelcome: true} }, {session});
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {

  await withTransaction(client, async (session) => {
    await db.collection("migrationTesting").updateOne({ id: "testId" }, { $set: {accessToken: "testAccessToken"} }, {session});
    await db.collection("migrationTesting").updateOne({ id: "testId" }, { $set: {migratedUser: false} }, {session});
    await db.collection("migrationTesting").updateOne({ id: "testId" }, { $set: { viewedWelcome: false } }, { session });
  });
};

