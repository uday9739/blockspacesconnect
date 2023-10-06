import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    // Add withdraw bitcoin feature flag to user details
    await db.collection<UserSchema>("userdetails").updateMany(
      {'featureFlags.withdrawBitcoin': {$exists: false}},
      {$set: {'featureFlags.withdrawBitcoin': false}},
      {session}
    )
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection<UserSchema>("userdetails").updateMany(
      {'featureFlags.withdrawBitcoin': {$exists: true}},
      {$unset: {'featureFlags.withdrawBitcoin': ""}},
      {session}
    )
  });
};

type UserSchema = {
  featureFlags?: { withdrawBitcoin?: boolean } 
}