import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.


    const connectors = await db.collection("connectors").find({ name: { $ne: "QuickBooks" } });

    for await (const data of connectors) {

      await db.collection("networkconnectorintegrations").insertOne({
        "network": "lightning",
        "active": true,
        "connector": data._id,
      }, { session });

    }
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
