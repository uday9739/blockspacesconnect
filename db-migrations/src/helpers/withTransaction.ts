import * as mongo from "mongodb";

export async function withTransaction(client: mongo.MongoClient, dbActions: mongo.WithTransactionCallback, options?: mongo.TransactionOptions) {
  const session = client.startSession();
  try {
    await session.withTransaction(
      dbActions,
      Object.assign({
        readPreference: mongo.ReadPreference.primaryPreferred,
        readConcern: { level: mongo.ReadConcernLevel.local },
        writeConcern: { w: "majority", j: true, wtimeout: 5 * 1000 },
        maxCommitTimeMS: 5 * 1000,
      }, options)
    );
  } finally {
    await session.endSession();
  }
}
