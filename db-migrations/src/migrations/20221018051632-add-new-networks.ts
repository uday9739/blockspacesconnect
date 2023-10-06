import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection<any>("networks").insertMany(networks);
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection<any>("networks").drop();
  });
};

export const networks: any[] = [
  {
    "_id": "polygon",
    "name": "Polygon Mainnet",
    "logo": "/images/chain-logos/polygon.png",
    "description": "Polygon Mainnet"
  }, {
    "_id": "ethereum",
    "name": "Ethereum Mainnet",
    "logo": "/images/chain-logos/ethereum.png",
    "description": "Ethereum Mainnet"
  },
  {
    "_id": "lightning",
    "name": "Lightning Network",
    "logo": "/images/light-lightningnetwork.png",
    "description": "Lightning Fast, Low-Fee, Payments & Invoicing"
  },
  {
    "_id": "pocket",
    "name": "Pocket Network",
    "logo": "/images/light-pocketnetwork.png",
    "description": "Decentralized Blockchain Infrastructure"
  }
];
