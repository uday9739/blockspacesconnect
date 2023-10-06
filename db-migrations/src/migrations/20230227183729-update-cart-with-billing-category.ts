import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const cartsExists = await db.listCollections({ name: "carts" }).hasNext();
    if (!cartsExists) {
      return;
    }
    const networkpricebillingcategoriesExists = await db.listCollections({ name: "networkpricebillingcategories" }).hasNext();
    if (!networkpricebillingcategoriesExists) {
      return;
    }

    const developerEndpointCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "developerEndpoint" });;
    const lightningCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "lightning" });;

    const carts = await db.collection("carts").find({ billingCategory: { $exists: false } });
    for await (const data of carts) {
      const targetCat = data.networkId === "lightning" ? lightningCategory : developerEndpointCategory;
      await db.collection("carts").updateOne({ _id: data._id },
        {
          $set: {
            "billingCategory": targetCat?._id
          },
        },
        { upsert: false }
      );

    }
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
