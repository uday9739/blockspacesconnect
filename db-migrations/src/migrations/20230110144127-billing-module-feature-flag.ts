import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    // Add testFlag1 to userdetails documents
    await db.collection<UserSchema>("userdetails").updateMany(
      { 'featureFlags.billingModule': { $exists: false } },
      { $set: { 'featureFlags.billingModule': false } },
      { session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection<UserSchema>("userdetails").updateMany(
      { 'featureFlags.billingModule': { $exists: true } },
      { $unset: { 'featureFlags.billingModule': "" } },
      { session }
    );
  });
};

type UserSchema = {
  featureFlags?: { billingModule?: boolean }
}

