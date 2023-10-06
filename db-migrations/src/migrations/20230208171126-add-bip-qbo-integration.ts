import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection<IntegrationsSchema>("externalintegrations").insertMany(
      [{ id: 'BIP_QBO', name: 'Bitcoin Invoicing & Payments to QuickBooks', description: 'Integration between BlockSpaces Bitcoin Invoicing & Payments and QuickBooks' }],
      { session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};

type IntegrationsSchema = {
  id: string;
  name: string;
  description: string;
}