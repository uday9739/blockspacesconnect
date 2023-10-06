import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    await db.collection<InvoiceSchema>("lightninginvoices").updateMany(
      { "erpObjects": { $exists: false } },
      { $set: { "erpObjects": [] } },
      { session }
    );
    await db.collection<InvoiceSchema>("lightningpayments").updateMany(
      { "erpObjects": { $exists: false } },
      { $set: { "erpObjects": [] } },
      { session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
    await db.collection<InvoiceSchema>("lightninginvoices").updateMany(
      { "erpObjects": { $exists: false } },
      { $unset: { "erpObjects": "" } },
      { session }
    );
    await db.collection<InvoiceSchema>("lightningpayments").updateMany(
      { "erpObjects": { $exists: false } },
      { $unset: { "erpObjects": "" } },
      { session }
    );
  });
};

type InvoiceSchema = {
  erpObjects?: []
}
