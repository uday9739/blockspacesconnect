import * as mongo from "mongodb";
import { userInfo } from "os";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const tenantsWithUsersAndNoEmails = await db.collection('tenants').find({ "users.email": { $exists: false }, tenantType: 'personal' });
    for await (let tenant of tenantsWithUsersAndNoEmails) {
      for (let i = 0; i < tenant.users.length; i++) {
        const userDetails = await db.collection('userdetails').findOne({ "id": tenant.users[i].userId })
        if (userDetails) {
          tenant.users[i].email = userDetails.email
        }
      }
      await db.collection('tenants').findOneAndUpdate({ tenantId: tenant.tenantId }, { $set: { users: tenant.users } })
    }
  });
};
