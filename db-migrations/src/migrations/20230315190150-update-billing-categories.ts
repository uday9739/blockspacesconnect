import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const currentLightningCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "MultiWebApp" });
    await db.collection("networkpricebillingcategories").updateOne({ _id: currentLightningCategory?._id },
      {
        $set: {
          "name": "Multiweb Apps",
          "description": "Preconfigured integrations that combine Web2 + Web3 capabilities.",
          "active": true
        },
      },
      { upsert: false }
    );

    const InfrastructureCategory = await db.collection("networkpricebillingcategories").findOne({ "code": "Infrastructure" });
    await db.collection("networkpricebillingcategories").updateOne({ _id: InfrastructureCategory?._id },
      {
        $set: {
          "name": "Multiweb Infrastructure",
          "description": "A library of Web3 nodes you can use to build your dApp.",
          "active": true
        },
      },
      { upsert: false }
    );

    await db.collection("networkpricebillingcategories").insertMany([
      {
        "name": "Business Connectors",
        "code": 'BusinessConnectors',
        "description": "A library of Web2 business application APIs to build workflows.",
        "sortOrder": 20,
        "slug": "business-connectors",
        "active": false
      }
    ], { session });

  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};
