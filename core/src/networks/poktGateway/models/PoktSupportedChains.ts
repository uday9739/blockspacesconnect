import { NetworkId } from "@blockspaces/shared/models/networks";

interface RelayChain {
  name: string;
  networkId: string;
  portalApiPrefix: string;
  relayChainId: string;
  supported: boolean;
}
//https://docs.pokt.network/home/supported-blockchains
export const PoktSupportedChains: RelayChain[] = [
  {
    name: "Optimism",
    networkId: NetworkId.OPTIMISM,
    portalApiPrefix: "optimism-mainnet",
    relayChainId: "0053",
    supported: true
  }
  // {
  //   name: "Algorand",
  //   portalApiPrefix: "algo-mainnet",
  //   relayChainId: "0029",
  //   supported: false
  // },
  // {
  //   name: "Binance Smart Chain",
  //   portalApiPrefix: "bsc-mainnet",
  //   relayChainId: "0004",
  //   supported: false
  // },
  // {
  //   name: "Avalanche",
  //   portalApiPrefix: "avax-mainnet",
  //   relayChainId: "0003",
  //   supported: false
  // },
  // {
  //   name: "Binance Smart Chain Archival",
  //   portalApiPrefix: "bsc-archival",
  //   relayChainId: "0010",
  //   supported: false
  // },
  // {
  //   name: "Boba",
  //   portalApiPrefix: "boba-mainnet",
  //   relayChainId: "0048",
  //   supported: false
  // },
  // {
  //   name: "DFKchain Subnet",
  //   portalApiPrefix: "dfk-mainnet",
  //   relayChainId: "03DF",
  //   supported: false
  // },
  // {
  //   name: "Evmos",
  //   portalApiPrefix: "evmos-mainnet",
  //   relayChainId: "0046",
  //   supported: false
  // },
  // {
  //   name: "Ethereum",
  //   portalApiPrefix: "eth-mainnet",
  //   relayChainId: "0021",
  //   supported: false
  // },
  // {
  //   name: "Ethereum Archival",
  //   portalApiPrefix: "eth-archival",
  //   relayChainId: "0022",
  //   supported: false
  // },
  // {
  //   name: "Ethereum Archival Trace",
  //   portalApiPrefix: "eth-archival-trace",
  //   relayChainId: "0028",
  //   supported: false
  // },
  // {
  //   name: "Ethereum Goerli",
  //   portalApiPrefix: "eth-goerli",
  //   relayChainId: "0026",
  //   supported: false
  // },
  // {
  //   name: "Ethereum Kovan",
  //   portalApiPrefix: "poa-kovan",
  //   relayChainId: "0024",
  //   supported: false
  // },
  // {
  //   name: "Ethereum Rinkeby",
  //   portalApiPrefix: "eth-rinkeby",
  //   relayChainId: "0025",
  //   supported: false
  // },
  // {
  //   name: "Ethereum Ropsten",
  //   portalApiPrefix: "eth-ropsten",
  //   relayChainId: "0023",
  //   supported: false
  // },
  // {
  //   name: "Fantom",
  //   portalApiPrefix: "fantom-mainnet",
  //   relayChainId: "0049",
  //   supported: false
  // },
  // {
  //   name: "FUSE",
  //   portalApiPrefix: "fuse-mainnet",
  //   relayChainId: "0005",
  //   supported: false
  // },
  // {
  //   name: "FUSE Archival",
  //   portalApiPrefix: "fuse-archival",
  //   relayChainId: "000A",
  //   supported: false
  // },
  // {
  //   name: "Gnosis Chain",
  //   portalApiPrefix: "gnosischain-mainnet",
  //   relayChainId: "0027",
  //   supported: false
  // },
  // {
  //   name: "Gnosis Chain Archival",
  //   portalApiPrefix: "gnosischain-archival",
  //   relayChainId: "000C",
  //   supported: false
  // },
  // {
  //   name: "Harmony Shard 0",
  //   portalApiPrefix: "harmony-0",
  //   relayChainId: "0040",
  //   supported: false
  // },
  // {
  //   name: "IoTeX",
  //   portalApiPrefix: "iotex-mainnet",
  //   relayChainId: "0044",
  //   supported: false
  // },
  // {
  //   name: "Moonbeam",
  //   portalApiPrefix: "moonbeam-mainnet",
  //   relayChainId: "0050",
  //   supported: false
  // },
  // {
  //   name: "Moonriver",
  //   portalApiPrefix: "moonriver-mainnet",
  //   relayChainId: "0051",
  //   supported: false
  // },
  // {
  //   name: "NEAR",
  //   portalApiPrefix: "near-mainnet",
  //   relayChainId: "0052",
  //   supported: false
  // },
  // {
  //   name: "OKExChain",
  //   portalApiPrefix: "oec-mainnet",
  //   relayChainId: "0047",
  //   supported: false
  // },
  // {
  //   name: "Pocket Network",
  //   portalApiPrefix: "mainnet",
  //   relayChainId: "0001",
  //   supported: false
  // },
  // {
  //   name: "Polygon",
  //   portalApiPrefix: "poly-mainnet",
  //   relayChainId: "0009",
  //   supported: false
  // },
  // {
  //   name: "Polygon Archival",
  //   portalApiPrefix: "poly-archival",
  //   relayChainId: "000B",
  //   supported: false
  // },
  // {
  //   name: "Solana",
  //   portalApiPrefix: "sol-mainnet",
  //   relayChainId: "0006",
  //   supported: false
  // },
  // {
  //   name: "Swimmer Network Mainnet",
  //   portalApiPrefix: "avax-cra",
  //   relayChainId: "03CB",
  //   supported: false
  // }
];
