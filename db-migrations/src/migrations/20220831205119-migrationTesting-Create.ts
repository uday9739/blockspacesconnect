import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {

  await withTransaction(client, async (session) => {
    await db.collection("migrationTesting").insertMany([data], { session });
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session) => {
    await db.collection("migrationTesting").findOneAndDelete({ id: data.id }, { session });
  });
};

/**
 * example data to be added to the collection.
 */
const data = {
  email: "UserEMail",
  tenants: "testTenants",
  accessToken: "testAccessToken",
  id: "testId",
  migratedUser: false,
  firstLogin: true,
  whmcs: {
    clientId: 12345,
    ownerId: 54321
  },
  serviceNow: {
    sysId: "testSysId",
    account: "testAcctId"
  },
  twoFAStatus: "test2FaStatus",
  firstName: "Chris",
  lastName: "Tate",
  tosDate: "2022-08-31 12:12:12",
  featureFlags: {
    "Pocket Network": true,
    "Lightning Network": false,
    QuickBooks: false,
    "Optimism Network": false
  },
  viewedWelcome: false,
  connectedNetworks: "Pocket"
};


