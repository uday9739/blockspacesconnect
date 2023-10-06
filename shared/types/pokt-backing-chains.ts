export enum PoktBackingChains {
  "Algorand" = 0x0002,
  "Avalanche" = 0x0003,
  "Binance Smart Chain" = 0x0004,
  "Binance Smart Chain Archival" = 0x0010,
  "Boba" = 0x0048,
  "DFKchain Subnet" = 0x03df,
  "Evmos" = 0x0046,
  "Ethereum" = 0x0021,
  "Ethereum Archival" = 0x0022,
  "Ethereum Archival Trace" = 0x0028,
  "Ethereum Goerli" = 0x0026,
  "Ethereum Kovan" = 0x0024,
  "Ethereum Rinkeby" = 0x0025,
  "Ethereum Ropsten" = 0x0023,
  "Fantom" = 0x0049,
  "FUSE" = 0x0005,
  "FUSE Archival" = 0x000a,
  "Gnosis Chain" = 0x0027,
  "Gnosis Chain Archival" = 0x000c,
  "Harmony Shard 0" = 0x0040,
  "IoTeX" = 0x0044,
  "Klaytn Mainnet" = 0x0056,
  "Moonbeam" = 0x0050,
  "Moonriver" = 0x0051,
  "NEAR" = 0x0052,
  "OKExChain" = 0x0047,
  "Optimism" = 0x0053,
  "Osmosis Mainnet" = 0x0054,
  "Pocket Network" = 0x0001,
  "Polygon" = 0x0009,
  "Polygon Archival" = 0x000b,
  "Polygon Mumbai" = 0x000F,
  "Solana" = 0x0006,
  "Swimmer Network Mainnet" = 0x03cb
}

export const supportedChains = [
  "Algorand",
  "Avalanche",
  "Binance Smart Chain",
  "Binance Smart Chain Archival",
  "Boba",
  "DFKchain Subnet",
  "Evmos",
  "Ethereum",
  "Ethereum Archival",
  "Ethereum Archival Trace",
  "Ethereum Goerli",
  "Ethereum Kovan",
  "Ethereum Ropsten",
  "Ethereum Rinkeby",
  "Fantom",
  "FUSE",
  "FUSE Archival",
  "Gnosis Chain",
  "Gnosis Chain Archival",
  "Harmony Shard 0",
  "IoTeX",
  "Klaytn Mainnet",
  "Moonbeam",
  "Moonriver",
  "NEAR",
  "OKExChain",
  "Optimism",
  "Osmosis Mainnet",
  "Pocket Network",
  "Polygon",
  "Polygon Archival",
  "Polygon Mumbai",
  "Solana",
  "Swimmer Network Mainnet"
];

export const chainDetail: { [chain: string]: { logo: string; color: string, chainSlug: string } } = {
  Algorand: {
    logo: "",
    color: "",
    chainSlug: "algo-mainnet"
  },
  Avalanche: {
    logo: "/images/chain-logos/avalanche.png",
    color: "#e84141",
    chainSlug: "avax-mainnet"
  },
  "Binance Smart Chain": {
    logo: "/images/chain-logos/bsc.png",
    color: "#f3ba2e",
    chainSlug: "bsc-mainnet"
  },
  "Binance Smart Chain Archival": {
    logo: "/images/chain-logos/bsc-archival.png",
    color: "#c7951d",
    chainSlug: "bsc-archival"
  },
  Boba: {
    logo: "/images/chain-logos/boba.png",
    color: "#3fd8d2",
    chainSlug: "boba-mainnet"
  },
  "DFKchain Subnet": {
    logo: "/images/chain-logos/dfk-subnet.png",
    color: "#61e943",
    chainSlug: "avax-dfk"
  },
  Evmos: {
    logo: "/images/chain-logos/evmos.png",
    color: "#2d2a25",
    chainSlug: "evmos-mainnet"
  },
  Ethereum: {
    logo: "/images/chain-logos/eth.png",
    color: "#9799e7",
    chainSlug: "eth-mainnet"
  },
  "Ethereum Archival": {
    logo: "/images/chain-logos/eth-archival.png",
    color: "#c27298",
    chainSlug: "eth-archival"
  },
  "Ethereum Archival Trace": {
    logo: "/images/chain-logos/eth-archival-trace.png",
    color: "#72c2b4",
    chainSlug: "eth-archival-trace"
  },
  "Ethereum Goerli": {
    logo: "/images/chain-logos/eth-goerli.png",
    color: "#9f72c2",
    chainSlug: "eth-goerli"
  },
  "Ethereum Kovan": {
    logo: "/images/chain-logos/eth-kovan.png",
    color: "#c27272",
    chainSlug: "poa-kovan"
  },
  "Ethereum Rinkeby": {
    logo: "/images/chain-logos/eth-rinkeby.png",
    color: "#727ac2",
    chainSlug: "eth-rinkeby"
  },
  "Ethereum Ropsten": {
    logo: "/images/chain-logos/eth-ropsten.png",
    color: "#acb2ed",
    chainSlug: "eth-ropsten"
  },
  Fantom: {
    logo: "/images/chain-logos/fantom.png",
    color: "#39b5ec",
    chainSlug: "fantom-mainnet"
  },
  FUSE: {
    logo: "/images/chain-logos/fuse.png",
    color: "#e5f689",
    chainSlug: "fuse-mainnet"
  },
  "FUSE Archival": {
    logo: "/images/chain-logos/fuse-archival.png",
    color: "#ba5b5b",
    chainSlug: "fuse-archival"
  },
  "Gnosis Chain": {
    logo: "/images/chain-logos/gnosis.png",
    color: "#4eabc5",
    chainSlug: "gnosischain-mainnet"
  },
  "Gnosis Chain Archival": {
    logo: "/images/chain-logos/gnosis-archival.png",
    color: "#2e829a",
    chainSlug: "gnosischain-archival"
  },
  "Harmony Shard 0": {
    logo: "/images/chain-logos/harmony.png",
    color: "#4ae4c9",
    chainSlug: "harmony-0"
  },
  IoTeX: {
    logo: "/images/chain-logos/iotex.png",
    color: "#3ed4d5",
    chainSlug: "iotex-mainnet"
  },
  "Klaytn Mainnet": {
    logo: "/images/chain-logos/klaytn-mainnet.png",
    color: "#f76120",
    chainSlug: "klaytn-mainnet"
  },
  Moonbeam: {
    logo: "/images/chain-logos/moonbeam.png",
    color: "#e1147b",
    chainSlug: "moonbeam-mainnet"
  },
  Moonriver: {
    logo: "/images/chain-logos/moonriver.png",
    color: "#f2b703",
    chainSlug: "moonriver-mainnet"
  },
  NEAR: {
    logo: "/images/chain-logos/near.png",
    color: "#000000",
    chainSlug: "near-mainnet"
  },
  OKExChain: {
    logo: "/images/chain-logos/oke.png",
    color: "#000000",
    chainSlug: "oec-mainnet"
  },
  Optimism: {
    logo: "/images/chain-logos/optimism.png",
    color: "#f71220",
    chainSlug: "optimism-mainnet"
  },
  "Osmosis Mainnet": {
    logo: "/images/chain-logos/osmosis-mainnet.png",
    color: "#6C08AF",
    chainSlug: "osmosis-mainnet"
  },
  "Pocket Network": {
    logo: "/images/chain-logos/pocket.png",
    color: "#308aed",
    chainSlug: "mainnet"
  },
  Polygon: {
    logo: "/images/chain-logos/polygon.png",
    color: "#8247e5",
    chainSlug: "polygon"
  },
  "Polygon Archival": {
    logo: "/images/chain-logos/polygon-archival.png",
    color: "#6029b9",
    chainSlug: "poly-archival"
  },
  "Polygon Mumbai": {
    logo: "/images/chain-logos/polygon-mumbai.png",
    color: "#4019b9",
    chainSlug: "polygon-mumbai"
  },
  Solana: {
    logo: "/images/chain-logos/solana.png",
    color: "#607bd4",
    chainSlug: "solana-mainnet"
  },
  "Swimmer Network Mainnet": {
    logo: "/images/chain-logos/swimmer.png",
    color: "#f7219a",
    chainSlug: "avax-cra"
  }
};


/** Given a Pokt backing chain code will return string with name of the chain
 *
 * */
export function getPoktBackingChainName(code: string): string {
  if (-1 === code.search("0x")) code = "0x" + code;
  return PoktBackingChains[parseInt(code)];
}

/** Given a string with Pokt chain name will return a string with chain code
 *
 * */
export function getPoktBackingChainCode(code: string) {
  return PoktBackingChains[code].toString("16").padStart(4, "0").toUpperCase();
}

