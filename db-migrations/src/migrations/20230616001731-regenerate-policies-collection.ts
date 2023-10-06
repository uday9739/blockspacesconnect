import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    const users = await db.collection('userdetails').find()
    if (!users) {
      throw new Error('Error finding users')
    }
    try {
      const dropOk = await db.collection('policies').drop({ writeConcern: { w: 0 } })
    } catch (error) {
      console.log(error)
    }
    for await (const user of users) {
      // old policy 
      //    ptype = p
      //    v0 = userId
      //    v1 = tenantId
      //    v2 = resource
      //    v3 = read/write

      // new policy
      //    ptype = g
      //    v0 = userId
      //    v1 = roles {'tenant-user',tenant-user-admin','billing-admin'}
      //    v2 = tenantId
      //
      //    ptype = p
      //    v0 = role
      //    v1 = tenantId
      //    v2 = resource
      //    v3 = read/write

      const { id, tenants } = user;
      // Look for a policy each role: tenant-user, tenant-user-admin, billing-admin
      for await (const tenantId of tenants) {
        db.collection('policies').insertOne({
          ptype: 'g',
          v0: id,
          v1: 'tenant-user',
          v2: tenantId
        })
        db.collection('policies').insertOne({
          ptype: 'g',
          v0: id,
          v1: 'tenant-user-admin',
          v2: tenantId
        })
        db.collection('policies').insertOne({
          ptype: 'g',
          v0: id,
          v1: 'billing-admin',
          v2: tenantId
        })
      }
    }
    const allTenants = await db.collection('tenants').find()
    if (!allTenants) {
      throw new Error('Error finding users')
    }

    for await (const tenant of allTenants) {
      const { tenantId } = tenant
      db.collection('policies').insertOne({
        ptype: 'p',
        v0: 'tenant-user',
        v1: tenantId,
        v2: 'tenant',
        v3: 'read'
      })
      db.collection('policies').insertOne({
        ptype: 'p',
        v0: 'tenant-user',
        v1: tenantId,
        v2: 'tenant-member',
        v3: 'read'
      })
      db.collection('policies').insertOne({
        ptype: 'p',
        v0: 'tenant-user-admin',
        v1: tenantId,
        v2: 'tenant',
        v3: 'write'
      })
      db.collection('policies').insertOne({
        ptype: 'p',
        v0: 'tenant-user',
        v1: tenantId,
        v2: 'tenant-member-permissions',
        v3: 'read'
      })
      db.collection('policies').insertOne({
        ptype: 'p',
        v0: 'tenant-user-admin',
        v1: tenantId,
        v2: 'tenant-member',
        v3: 'write'
      })
      db.collection('policies').insertOne({
        ptype: 'p',
        v0: 'tenant-user-admin',
        v1: tenantId,
        v2: 'tenant-member-permissions',
        v3: 'write'
      })
      db.collection('policies').insertOne({
        ptype: 'p',
        v0: 'billing-admin',
        v1: tenantId,
        v2: 'invoices',
        v3: 'read'
      })
      db.collection('policies').insertOne({
        ptype: 'p',
        v0: 'billing-admin',
        v1: tenantId,
        v2: 'invoices',
        v3: 'write'
      })
      db.collection('policies').insertOne({
        ptype: 'p',
        v0: 'billing-admin',
        v1: tenantId,
        v2: 'payment-methods',
        v3: 'read'
      })
      db.collection('policies').insertOne({
        ptype: 'p',
        v0: 'billing-admin',
        v1: tenantId,
        v2: 'payment-methods',
        v3: 'write'
      })

    }
  });
};