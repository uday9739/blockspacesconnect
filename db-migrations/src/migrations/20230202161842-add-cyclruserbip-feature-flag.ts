import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    // Add testFlag1 to userdetails documents
    await db.collection<UserSchema>("userdetails").updateMany(
      { 'featureFlags.cyclrUserBIP': { $exists: false } },
      { $set: { 'featureFlags.cyclrUserBIP': false } },
      { session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection<UserSchema>("userdetails").updateMany(
      { 'featureFlags.cyclrUserBIP': { $exists: true } },
      { $unset: { 'featureFlags.cyclrUserBIP': "" } },
      { session }
    );
  });
};

type UserSchema = {
  featureFlags?: { cyclrUserBIP?: boolean }
}

