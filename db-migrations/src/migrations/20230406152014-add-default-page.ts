import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";


export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    await db.collection<UserSchema>("userdetails").updateMany(
      { 'appSettings.defaultPage': { $exists: false } },
      { $set: { 'appSettings.defaultPage': '/connect' } },
      { session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection<UserSchema>("userdetails").updateMany(
      { "appSettings.defaultPage": { $exists: true } },
      { "$unset": { "appSettings.defaultPage": "" } },
      { session }
    );
  });
};

type UserSchema = {
  appSettings? : { bip?: {displayFiat?: boolean}, defaultPage?: string }
}