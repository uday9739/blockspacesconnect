import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";
import { networks as priorNetworks } from './20221018051632-add-new-networks';

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection<any>("networks").drop();
    await db.collection<any>("networks").insertMany(networks);
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection<any>("networks").drop();
    await db.collection<any>("networks").insertMany(priorNetworks);
  });
};

export const networks = [{
  "_id": "polygon",
  "name": "Polygon",
  "logo": "/images/chain-logos/polygon.png",
  "description": "Interact with Polygon Mainnet through your own dedicated endpoint",
  "primaryColor": "#8247e5",
  "secondaryColor": "#6C21EA",
  "protocolRouterBackend": "poly-mainnet_be"
}, {
  "_id": "ethereum",
  "name": "Ethereum",
  "logo": "/images/chain-logos/ethereum.png",
  "description": "Ethereum",
  "primaryColor": "#9799e7",
  "secondaryColor": "#c6cbfa",
  "protocolRouterBackend": "eth-mainnet_be"
}, {
  "_id": "lightning",
  "name": "Bitcoin Invoicing & Payments",
  "logo": "/images/light-lightningnetwork.png",
  "description": "Lightning Fast, Low-Fee, Payments & Invoicing",
  "primaryColor": "#7B1AF7",
  "secondaryColor": "#BE1AF7"
}, {
  "_id": "pocket",
  "name": "Pocket Staking",
  "logo": "/images/light-pocketnetwork.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#37AFED",
  "secondaryColor": "#1D8AED"
}, {
  "_id": "avalanche",
  "name": "Avalanche",
  "logo": "/images/light-avalanche.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#E84142",
  "secondaryColor": "#F42123",
  "protocolRouterBackend": "avax-mainnet_be"
}, {
  "_id": "harmony",
  "name": "Harmony",
  "logo": "/images/light-harmony.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#00b0e8",
  "secondaryColor": "#67f8be",
  "protocolRouterBackend": "harmony-0_be"
}, {
  "_id": "gnosis",
  "name": "Gnosis",
  "logo": "/images/light-gnosis.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#4eabc5",
  "secondaryColor": "#33AFD1",
  "protocolRouterBackend": "gnosischain-mainnet_be"
}, {
  "_id": "solana",
  "name": "Solana",
  "logo": "/images/light-solana.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#FCF9FD",
  "secondaryColor": "#F5FDFA",
  "protocolRouterBackend": "solana-mainnet_be"
}, {
  "_id": "fantom",
  "name": "Fantom",
  "logo": "/images/light-fantom.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#11b5ec",
  "secondaryColor": "#00C2FF",
  "protocolRouterBackend": "fantom-mainnet_be"
}, {
  "_id": "binance",
  "name": "Binance Smart Chain",
  "logo": "/images/light-binance.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#efb90b",
  "secondaryColor": "#FFC300",
  "protocolRouterBackend": "bsc-mainnet_be"
}, {
  "_id": "fuse",
  "name": "Fuse",
  "logo": "/images/light-fuse.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#000000",
  "secondaryColor": "#000000",
  "protocolRouterBackend": "fuse-mainnet_be"
}, {
  "_id": "ethereum-archival",
  "name": "Ethereum",
  "chain": "Archival",
  "logo": "/images/chain-logos/ethereum.png",
  "description": "Ethereum Mainnet",
  "primaryColor": "#9799e7",
  "secondaryColor": "#c6cbfa",
  "protocolRouterBackend": "eth-mainnet_be"
}, {
  "_id": "ethereum-archival-trace",
  "name": "Ethereum",
  "chain": "Archival Trace",
  "logo": "/images/chain-logos/ethereum.png",
  "description": "Ethereum Mainnet Archival Trace",
  "primaryColor": "#9799e7",
  "secondaryColor": "#c6cbfa",
  "protocolRouterBackend": "eth-archival-trace_be"
}, {
  "_id": "bsc-archival",
  "name": "Binance Smart Chain",
  "chain": "Archival",
  "logo": "/images/light-binance.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#efb90b",
  "secondaryColor": "#FFC300",
  "protocolRouterBackend": "bsc-archival_be"
}, {
  "_id": "ethereum-goerli",
  "name": "Ethereum",
  "chain": "Goerli",
  "logo": "/images/chain-logos/ethereum.png",
  "description": "Ethereum Goerli",
  "primaryColor": "#9799e7",
  "secondaryColor": "#c6cbfa",
  "protocolRouterBackend": "eth-goerli_be"
}, {
  "_id": "ethereum-goerli-archival",
  "name": "Ethereum",
  "chain": "Goerli Archival",
  "logo": "/images/chain-logos/ethereum.png",
  "description": "Ethereum Goerli Archival",
  "primaryColor": "#9799e7",
  "secondaryColor": "#c6cbfa",
  "protocolRouterBackend": "eth-goerli-archival_be"
}, {
  "_id": "gnosis-archival",
  "name": "Gnosis",
  "chain": "Archival",
  "logo": "/images/light-gnosis.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#4eabc5",
  "secondaryColor": "#33AFD1",
  "protocolRouterBackend": "gnosischain-archival_be"
}, {
  "_id": "polygon-mumbai",
  "name": "Polygon",
  "chain": "Mumbai",
  "logo": "/images/chain-logos/polygon.png",
  "description": "Interact with Polygon Mainnet through your own dedicated endpoint",
  "primaryColor": "#8247e5",
  "secondaryColor": "#6C21EA",
  "protocolRouterBackend": "polygon-mumbai_be"
}, {
  "_id": "polygon-archival",
  "name": "Polygon",
  "chain": "Archival",
  "logo": "/images/chain-logos/polygon.png",
  "description": "Interact with Polygon Mainnet through your own dedicated endpoint",
  "primaryColor": "#8247e5",
  "secondaryColor": "#6C21EA",
  "protocolRouterBackend": "poly-archival_be"
}, {
  "_id": "fuse-archival",
  "name": "Fuse",
  "chain": "Archival",
  "logo": "/images/light-fuse.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#000000",
  "secondaryColor": "#000000",
  "protocolRouterBackend": "fuse-archival_be"
}, {
  "_id": "okexchain",
  "name": "OKExChain",
  "logo": "/images/light-okexchain.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#E9F1FF",
  "secondaryColor": "#E9FAFF",
  "protocolRouterBackend": "oec-mainnet_be"
}, {
  "_id": "optimism",
  "name": "Optimism",
  "logo": "/images/light-optimismpng",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#FF0421",
  "secondaryColor": "#FF5E04",
  "protocolRouterBackend": "optimism-mainnet_be"
}, {
  "_id": "dogechain",
  "name": "Doge",
  "logo": "/images/light-fuse.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#ba9f32",
  "secondaryColor": "#e0cd81",
  "protocolRouterBackend": "dogechain-mainnet_be"
}, {
  "_id": "evmos",
  "name": "Evmos",
  "logo": "/images/light-evmos.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#2c2a26",
  "secondaryColor": "#34312C",
  "protocolRouterBackend": "evmos-mainnet_be"
}, {
  "_id": "klaytn",
  "name": "Klaytn",
  "logo": "/images/light-klaytn.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#FFFAF9",
  "secondaryColor": "#FFFBF6",
  "protocolRouterBackend": "klaytn-mainnet_be"
}, {
  "_id": "metis",
  "name": "Metis",
  "logo": "/images/light-klaytn.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#00dacb",
  "secondaryColor": "#00dacb",
  "protocolRouterBackend": "metis-mainnet_be"
}, {
  "_id": "iotex",
  "name": "IoTeX",
  "logo": "/images/light-klaytn.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#00d4d5",
  "secondaryColor": "#00d4d5",
  "protocolRouterBackend": "iotex-mainnet_be"
}, {
  "_id": "dfkchain",
  "name": "DFKChain",
  "logo": "/images/light-dfkchain.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#F6FDE8",
  "secondaryColor": "#FCFDE8",
  "protocolRouterBackend": "avax-dfk_be"
}, {
  "_id": "boba",
  "name": "Boba",
  "logo": "/images/boba.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#000000",
  "secondaryColor": "#000000",
  "protocolRouterBackend": "boba-mainnet_be"
}, {
  "_id": "moonriver",
  "name": "Moonriver",
  "logo": "/images/moonriver.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#0e122f",
  "protocolRouterBackend": "moonriver-mainnet_be"
}, {
  "_id": "moonbeam",
  "name": "Moonbeam",
  "logo": "/images/moonebeam.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#0E122F",
  "protocolRouterBackend": "moonbeam-mainnet_be"
}, {
  "_id": "near",
  "name": "Near",
  "logo": "/images/near.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#000000",
  "protocolRouterBackend": "near-mainnet_be"
}, {
  "_id": "osmosis",
  "name": "Osmosis",
  "logo": "/images/osmosis.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#8201D7",
  "secondaryColor": "#BA24EF",
  "protocolRouterBackend": "osmosis-mainnet_be"
}, {
  "_id": "swimmer",
  "name": "Swimmer",
  "logo": "/images/swimmer.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#000000",
  "protocolRouterBackend": "avax-cra_be"
}, {
  "_id": "starknet",
  "name": "Starknet",
  "logo": "/images/starknet.png",
  "description": "Decentralized Blockchain Infrastructure",
  "primaryColor": "#f2f2f2",
  "protocolRouterBackend": "starknet-testnet_be"
}];