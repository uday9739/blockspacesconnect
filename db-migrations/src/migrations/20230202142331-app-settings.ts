import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    await db.collection<UserSchema>("userdetails").updateMany(
      { 'appSettings.bip.currencyPreference': { $exists: false }},
      { $set: { 'appSettings.bip.displayFiat': false } },
      { session }
    )
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection<UserSchema>("userdetails").updateMany(
      { "appSettings.bip.displayFiat": {$exists: true } },
      { "$unset": { "appSettings": "" } },
      { session }
    )
  });
};

type UserSchema = {
  appSettings? : { bip?: {displayFiat?: boolean}}
}
