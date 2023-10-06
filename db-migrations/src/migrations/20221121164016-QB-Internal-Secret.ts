import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await withTransaction(client, async (session) => {
      await db.collection("usersecrets").insertMany([data], { session });
    });
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    // Migration down code here.
  });
};


const data = {
  "credentialId": "8f7e8180-cb59-444a-a248-61ec71277113",
  "userId": "98e8d5cb-f04b-4c30-94e8-d0ae67710ec3",
  "tenantId": "98e8d5cb-f04b-4c30-94e8-d0ae67710ec3",
  "label": "QuickBooks",
  "description": "Holds the Blockspace OAuthClient Token from intuit-oauth",
  "subPath": "quickbooks"
};