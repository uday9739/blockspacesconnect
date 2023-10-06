import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    // Add featureFlags to userdetails documents
    await db.collection<UserSchema>("userdetails").updateMany(
      {},
      { $set: { featureFlags: {} } },
      { session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection<UserSchema>("userdetails").updateMany(
      { featureFlags: { $exists: true } },
      { $unset: { featureFlags: "" } },
      { session }
    );
  });
};

type UserSchema = {
  featureFlags?: Object
}
