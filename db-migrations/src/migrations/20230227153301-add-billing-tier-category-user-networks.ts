import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const usernetworksExists = await db.listCollections({ name: "usernetworks" }).hasNext();
    if (!usernetworksExists) {
      return;
    }
    const billingtiersExists = await db.listCollections({ name: "billingtiers" }).hasNext();
    if (!billingtiersExists) {
      return;
    }
    const networkpricebillingcategoriesExists = await db.listCollections({ name: "networkpricebillingcategories" }).hasNext();
    if (!networkpricebillingcategoriesExists) {
      return;
    }

    const basicTier = await db.collection("billingtiers").findOne({ "code": "Standard" });
    const developerEndpointCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "developerEndpoint" });;
    const lightningCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "lightning" });;

    const userNetworks = await db.collection("usernetworks").find({ billingTier: { $exists: false }, billingCategory: { $exists: false } });
    for await (const data of userNetworks) {
      const targetCat = data.networkId === "lightning" ? lightningCategory : developerEndpointCategory;
      await db.collection("usernetworks").updateOne({ _id: data._id },
        {
          $set: {
            "billingTier": basicTier?._id,
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
