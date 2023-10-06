import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    await db.collection<UserSchema>("userdetails").updateMany(
      { 'featureFlags.embedBMP': { $exists: false } },
      { $set: { 'featureFlags.embedBMP': false } },
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
  featureFlags?: { embedBMP?: boolean }
}

