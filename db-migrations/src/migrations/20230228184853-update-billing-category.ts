import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const Exists = await db.listCollections({ name: "networkpricebillingcategories" }).hasNext();
    if (!Exists) {
      return;
    }

    // 'lightning' ==> 'MultiWebApp'
    // 'developerEndpoint' ==> 'Infrastructure' 

    const currentLightningCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "lightning" });
    await db.collection("networkpricebillingcategories").updateOne({ _id: currentLightningCategory?._id },
      {
        $set: {
          "name": "Multi Web Apps",
          "code": 'MultiWebApp',
          "description": "Our low-code multiweb integration platform gives you access to Web3 payment rails, without getting rid of your core business applications.",
          "sortOrder": 0,
          "slug": "multi-web-app"
        },
      },
      { upsert: false }
    );

    const currentDeveloperEndpointCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "developerEndpoint" });
    await db.collection("networkpricebillingcategories").updateOne({ _id: currentDeveloperEndpointCategory?._id },
      {
        $set: {
          "name": "Infrastructure",
          "code": 'Infrastructure',
          "description": "",
          "sortOrder": 10,
          "slug": "infrastructure"
        },
      },
      { upsert: false }
    );

  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};


interface NetworkPriceBillingCategory {
  name: string;
  description: string;
  code: string
  sortOrder: number;
  slug: string;
}