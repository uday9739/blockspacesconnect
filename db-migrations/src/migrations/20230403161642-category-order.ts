import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    const BusinessConnectorsCode = 'BusinessConnectors';
    const InfrastructureCode = 'Infrastructure';

    await db.collection<any>("networkpricebillingcategories").updateOne(
      { "code": BusinessConnectorsCode },
      [{ $set: { "sortOrder": 10 } }],
      { session }
    );

    await db.collection<any>("networkpricebillingcategories").updateOne(
      { "code": InfrastructureCode },
      [{ $set: { "sortOrder": 20 } }],
      { session }
    );


  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
