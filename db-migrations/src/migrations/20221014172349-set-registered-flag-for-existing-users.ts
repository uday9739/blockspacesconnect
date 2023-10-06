import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

/**
 * Explicitly sets `{registered: true}` for users where the registered flag is not already defined
 */
export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection<UserSchema>("userdetails").updateMany(
      { registered: { $exists: false } },
      { $set: { registered: true } },
      { session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {

    await db.collection<UserSchema>("userdetails").updateMany(
      { registered: true },
      { $unset: { registered: "" } },
      { session }
    );

  });
};


type UserSchema = {
  registered?: boolean
}