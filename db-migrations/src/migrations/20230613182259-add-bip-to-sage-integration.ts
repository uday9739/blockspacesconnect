import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection<IntegrationsSchema>("externalintegrations").insertMany(
      [{ id: 'BIP_SAGE', name: 'Bitcoin Invoicing & Payments to Sage Intacct', description: 'Integration between BlockSpaces Bitcoin Invoicing & Payments and Sage Intacct' }],
      { session }
    );
  });
};

type IntegrationsSchema = {
  id: string;
  name: string;
  description: string;
}