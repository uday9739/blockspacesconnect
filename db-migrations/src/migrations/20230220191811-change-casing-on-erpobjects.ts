import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    await db.collection<ErpObjectSchema>("erpobjects").updateMany(
      { "objectType": { $exists: true } },
      [{ $set: { objectType: { $toLower: "$objectType" } } }],
      { session }
    );
    await db.collection<ErpObjectSchema>("erpobjects").updateMany(
      { "accountData.accountType": { $exists: true } },
      [{ $set: { "accountData.accountType": { $toLower: "$accountData.accountType" } } }],
      { session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};

type ErpObjectSchema = {
  objectType: string,
  accountData?: { accountType: string }
}