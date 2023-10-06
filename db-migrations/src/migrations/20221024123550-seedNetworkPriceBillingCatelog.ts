import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("networkpricebillingcategories").insertMany(
      [
        {
          name: "Lightning",
          code: "lightning",
          description: "Lightning"
        },
        {
          name: "Developer Endpoint",
          code: "developerEndpoint",
          description: "Developer Endpoint"
        }
      ],{ session }
    );
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("networkpricebillingcategories").drop();
  });
};
