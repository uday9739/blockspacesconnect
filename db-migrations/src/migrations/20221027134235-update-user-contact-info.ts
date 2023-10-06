// This migration will initially populate contact info for users in MongoDB,
// based on data imported in to the UserContactInfoImports collection.
//
// Data will only be updated if a user is found with a matching email (no inserts/upserts)
// and does not have an address currently set. Otherwise, no changes will be made.

import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {

  const importCollectionExists = await db.listCollections({ name: "UserContactInfoImports" }).hasNext();
  if (!importCollectionExists) {
    // do nothing if UserContactInfoImports collection doesn't exist
    return;
  }

  const contactInfoImports = db.collection<UserContactInfo>("UserContactInfoImports").find(
    {},
    { projection: { _id: 0 } }    // exclude _id property from results
  );

  await withTransaction(client, async (session: mongo.ClientSession) => {
    for await (const contactInfo of contactInfoImports) {
      await db.collection<UserContactInfo>("userdetails").findOneAndUpdate(
        { email: contactInfo.email, address: undefined },    // filter
        { $set: contactInfo },                               // update
        { session }                                          // options
      );
    }
  });

  // drop the "contact info imports" collection when everything's done
  await db.dropCollection("UserContactInfoImports");
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await db.createCollection("UserContactInfoImports");
};

interface UserContactInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;

  address: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}