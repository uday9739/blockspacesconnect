import * as mongo from "mongodb";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {

  const users = db.collection("userdetails");

  if (await users.indexExists("id_1")) {
    await users.dropIndex("id_1");
  }

  users.createIndex(
    { id: 1 },
    {
      name: "id",
      unique: true,
      sparse: true
    }
  );
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {

  const users = db.collection("userdetails");

  if (await users.indexExists("id")) {
    await users.dropIndex("id");
  }
};
