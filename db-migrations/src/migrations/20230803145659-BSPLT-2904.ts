import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration up code here.
    await withTransaction(client, async (session: mongo.ClientSession) => {

      /*
      * Change Multiweb Apps to say Applications
      */
      const MultiWebAppCategory = await db.collection<schema>("networkpricebillingcategories").findOneAndUpdate(
        { code: "MultiWebApp" },  // filter
        { $set: { name: "Applications" } },  // update
        { session }); // options


      /**
       * Remove the Business Connectors section 
       */
      const BusinessConnectorsCategory = await db.collection<schema>("networkpricebillingcategories").findOneAndUpdate(
        { code: "BusinessConnectors" },  // filter
        { $set: { active: false } },  // update
        { session });// options


      /**
       * Add Network (A.R.C. for Lending , A.R.C. OTC Derivatives)
       */

      await db.collection<any>("networks").insertMany([
        {
          "_id": "arc-lending",
          "name": "ARC for Lending",
          "logo": "/images/Arc-logo.png",
          "description": "Auto-Reconciled Collateral for Lending",
          "primaryColor": "#3c2085",
          "secondaryColor": "#b29aed"
        },
        {
          "_id": "arc-derivatives",
          "name": "ARC for OTC Derivatives",
          "logo": "/images/Arc-logo.png",
          "description": "Auto-Reconciled Collateral for OTC Derivatives",
          "primaryColor": "#3c2085",
          "secondaryColor": "#b29aed"
        }
      ]);

      /**
       * Insert Billing Tier
       * 
       */
      const WishListTier = await db.collection<any>("billingtiers").insertOne({
        "displayName": "Add to wish list",
        "tierSort": 0,
        "code": "WishListItem"
      });


      /**
       * Insert Offerings
       */


      // Migration up code here.
      await db.collection("networkofferings").insertMany([{
        "network": "arc-lending",
        "active": true,
        "title": "ARC for Lending",
        "description": `Auto-Reconciled Collateral for Lending`,
        "recurrence": "monthly",
        "billingCategory": MultiWebAppCategory?.value?._id,
        "billingTier": WishListTier?.insertedId
      },
      {
        "network": "arc-derivatives",
        "active": true,
        "title": "ARC for OTC Derivatives",
        "description": `Auto-Reconciled Collateral for OTC Derivatives`,
        "recurrence": "monthly",
        "billingCategory": MultiWebAppCategory?.value?._id,
        "billingTier": WishListTier?.insertedId
      }
      ], { session });

    });
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};

type schema = {
  name: string;
  code: string;
  active: boolean;
};
