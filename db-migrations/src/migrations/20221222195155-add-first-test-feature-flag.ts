import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    // Add testFlag1 to userdetails documents
    await db.collection<UserSchema>("userdetails").updateMany(
      { 'featureFlags.featureOne': { $exists: false } },
      { $set: { 'featureFlags.featureOne': false } },
      { session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection<UserSchema>("userdetails").updateMany(
      { 'featureFlags.featureOne': { $exists: true } },
      { $unset: { 'featureFlags.featureOne': "" } },
      { session }
    );
  });
};

type UserSchema = {
  featureFlags?: {featureOne?: boolean}
}

