import * as mongo from "mongodb";
import { withTransaction } from "../helpers/withTransaction";

export const up = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("networkcuratedresources").insertMany(data, { session });
  });
};

export const down = async (db: mongo.Db, client: mongo.MongoClient) => {
  await withTransaction(client, async (session: mongo.ClientSession) => {
    await db.collection("networkcuratedresources").drop();
  });
};

const data = [
  {
    "network": "avalanche",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "AVA Labs",
        "url": "https://subnets.avax.network/",
        "description": "Avalanche (AVAX) Blockchain Explorer"
      },
      {
        "category": "Documentation",
        "type": "Platform Documentation",
        "source": "AVA Labs",
        "url": "https://docs.avax.network/",
        "description": "Polygon Technology Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developer Documentation",
        "source": "AVA Labs",
        "url": "https://www.avax.network/developers",
        "description": "Build Ethereum dApps on Avalanche."
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "AVA Labs",
        "url": "https://support.avax.network/en/articles/4626956-how-do-i-set-up-metamask-on-avalanche",
        "description": "How do I set up MetaMask on Avalanche?"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "AVA Labs",
        "url": "https://twitter.com/avalancheavax",
        "description": "Avalanche Twitter Feed"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "AVA Labs",
        "url": "https://www.reddit.com/r/Avax/",
        "description": "Avalanche Reddit Feed"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "AVA Labs",
        "url": "https://discord.com/invite/RwXY7P6",
        "description": "Avalanche Discord Server"
      },
      {
        "category": "Community",
        "type": "Medium",
        "source": "AVA Labs",
        "url": "https://medium.com/avalancheavax",
        "description": "Avalanche Medium Feed"
      },
      {
        "category": "Sample Code",
        "type": "Avalanche Examples",
        "source": "Community",
        "url": "https://codesandbox.io/examples/package/avalanche",
        "description": "Learn how to use avalanche by viewing and forking example apps that make use of Avalanche"
      }
    ]
  },
  {
    "network": "harmony",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Harmony",
        "url": "https://explorer.harmony.one/",
        "description": "Harmony (ONE) Blockchain Explorer"
      },
      {
        "category": "Documentation",
        "type": "Protocol Documentation",
        "source": "Harmony",
        "url": "https://docs.harmony.one/home/",
        "description": "Harmony Documentation"
      },
      {
        "category": "API Documentation",
        "type": "Harmony API Documentation",
        "source": "Harmony",
        "url": "https://docs.harmony.one/home/developers/harmony-specifics/api",
        "description": "Harmony API Documentation"
      },
      {
        "category": "Community",
        "type": "GitHub",
        "source": "Harmony",
        "url": "https://github.com/harmony-one",
        "description": "Harmony One Repository"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Harmony Community",
        "url": "https://harmony.one/telegram",
        "description": "Harmony Telegram Server"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Harmony",
        "url": "https://harmony.one/discord",
        "description": "Harmony Discord Server"
      },
      {
        "category": "Community",
        "type": "Medium",
        "source": "Harmony",
        "url": "https://medium.com/harmony-one",
        "description": "Harmony Medium Feed"
      },
      {
        "category": "Sample Code",
        "type": "Examples",
        "source": "Harmony",
        "url": "https://docs.harmony.one/home/developers/harmony-specifics/api/sample-code",
        "description": "Examples using Harmony RPC Methods"
      }
    ]
  },
  {
    "network": "gnosis",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Block Scout",
        "url": "https://blockscout.com/xdai/mainnet",
        "description": "Gnosis (XDAI) Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "JSON RPC Documentation",
        "source": "Gnosis",
        "url": "https://docs.gnosischain.com/tools/rpc",
        "description": "Gnosis JSON RPC Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Gnosis",
        "url": "https://docs.gnosischain.com/developers",
        "description": "Gnosis Chain Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Gnosis",
        "url": "https://discord.gg/VQb3WzsywU",
        "description": "Gnosis Discord Server"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Gnosis",
        "url": "https://t.me/gnosischain",
        "description": "Gnosis Telegram Feed"
      },
      {
        "category": "Sample Code",
        "type": "Program examples",
        "source": "Solidity by Example",
        "url": "https://solidity-by-example.org/",
        "description": "Solidity by Example"
      }
    ]
  },
  {
    "network": "gnosis-archival",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Block Scout",
        "url": "https://blockscout.com/xdai/mainnet",
        "description": "Gnosis (XDAI) Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "JSON RPC Documentation",
        "source": "Gnosis",
        "url": "https://docs.gnosischain.com/tools/rpc",
        "description": "Gnosis JSON RPC Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Gnosis",
        "url": "https://docs.gnosischain.com/developers",
        "description": "Gnosis Chain Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Gnosis",
        "url": "https://discord.gg/VQb3WzsywU",
        "description": "Gnosis Discord Server"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Gnosis",
        "url": "https://t.me/gnosischain",
        "description": "Gnosis Telegram Feed"
      },
      {
        "category": "Sample Code",
        "type": "Program examples",
        "source": "Solidity by Example",
        "url": "https://solidity-by-example.org/",
        "description": "Solidity by Example"
      }
    ]
  },
  {
    "network": "ethereum-goerli-archival",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Etherscan",
        "url": "https://goerli.etherscan.io/",
        "description": "Ethereum Goerli Blockchain Explorer"
      },
      {
        "category": "Documentation",
        "type": "Protocol Documentation",
        "source": "Ethereum Foundation",
        "url": "https://ethereum.org/en/developers/docs/",
        "description": "Ethereum Development Documentation"
      },
      {
        "category": "API Documentation",
        "type": "Javascript API",
        "source": "Ethereum Foundation",
        "url": "https://ethereum.org/en/developers/docs/apis/javascript/",
        "description": "Ethereum Javascript API Documentation"
      },
      {
        "category": "API Documentation",
        "type": "Backend API",
        "source": "Ethereum Foundation",
        "url": "https://ethereum.org/en/developers/docs/apis/backend/",
        "description": "Ethereum Backend API Documentation"
      },
      {
        "category": "API Documentation",
        "type": "JSON-RPC API",
        "source": "Ethereum Foundation",
        "url": "https://ethereum.org/en/developers/docs/apis/json-rpc/",
        "description": "Ethereum JSON-RPC Documentation"
      },
      {
        "category": "API Documentation",
        "type": "Web3.js Documentation",
        "source": "Ethereum Foundation",
        "url": "https://docs.ethers.io/v5/",
        "description": "Complete and compact library for interacting with the Ethereum Blockchain and its ecosystem"
      },
      {
        "category": "API Documentation",
        "type": "Ethers.js Documentation",
        "source": "Ethers",
        "url": "https://docs.ethers.io/v5/",
        "description": "Complete and compact library for interacting with the Ethereum Blockchain and its ecosystem"
      },
      {
        "category": "API Documentation",
        "type": "Block Explorer API",
        "source": "Etherscan",
        "url": "https://goerli.etherscan.io/apidoc",
        "description": "Ethereum Goerli Etherscan API Documentation"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Ethereum Foundation",
        "url": "https://discord.com/invite/CetY6Y4",
        "description": "Ethereum Discord Server"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "Ethereum Foundation",
        "url": "https://www.reddit.com/r/ethereum/",
        "description": "r/ethereum"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Etherscan",
        "url": "https://goerli.etherscan.io/apidoc#contracts",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "ethereum-archival-trace",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Etherscan",
        "url": "https://goerli.etherscan.io/",
        "description": "Ethereum Goerli Blockchain Explorer"
      },
      {
        "category": "Documentation",
        "type": "Protocol Documentation",
        "source": "Ethereum Foundation",
        "url": "https://ethereum.org/en/developers/docs/",
        "description": "Ethereum Development Documentation"
      },
      {
        "category": "API Documentation",
        "type": "Javascript API",
        "source": "Ethereum Foundation",
        "url": "https://ethereum.org/en/developers/docs/apis/javascript/",
        "description": "Ethereum Javascript API Documentation"
      },
      {
        "category": "API Documentation",
        "type": "Backend API",
        "source": "Ethereum Foundation",
        "url": "https://ethereum.org/en/developers/docs/apis/backend/",
        "description": "Ethereum Backend API Documentation"
      },
      {
        "category": "API Documentation",
        "type": "JSON-RPC API",
        "source": "Ethereum Foundation",
        "url": "https://ethereum.org/en/developers/docs/apis/json-rpc/",
        "description": "Ethereum JSON-RPC Documentation"
      },
      {
        "category": "API Documentation",
        "type": "Web3.js Documentation",
        "source": "Ethereum Foundation",
        "url": "https://docs.ethers.io/v5/",
        "description": "Complete and compact library for interacting with the Ethereum Blockchain and its ecosystem"
      },
      {
        "category": "API Documentation",
        "type": "Ethers.js Documentation",
        "source": "Ethers",
        "url": "https://docs.ethers.io/v5/",
        "description": "Complete and compact library for interacting with the Ethereum Blockchain and its ecosystem"
      },
      {
        "category": "API Documentation",
        "type": "Block Explorer API",
        "source": "Etherscan",
        "url": "https://goerli.etherscan.io/apidoc",
        "description": "Ethereum Goerli Etherscan API Documentation"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Ethereum Foundation",
        "url": "https://discord.com/invite/CetY6Y4",
        "description": "Ethereum Discord Server"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "Ethereum Foundation",
        "url": "https://www.reddit.com/r/ethereum/",
        "description": "r/ethereum"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Etherscan",
        "url": "https://goerli.etherscan.io/apidoc#contracts",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "moonbeam",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Moonscan",
        "url": "https://moonscan.io/",
        "description": "Moonbeam (Polkadot) Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "API Documentation",
        "source": "Moonbeam Network",
        "url": "https://docs.moonbeam.network/builders/get-started/eth-compare/transfers-api/",
        "description": "Moonbeam (Polkadot) API Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Moonbeam Network",
        "url": "https://docs.moonbeam.network/",
        "description": "Moonbeam (Polkadot) Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "Moonbeam Network",
        "url": "https://docs.moonbeam.network/tokens/connect/metamask/",
        "description": "Moonbeam (Polkadot) Metamask Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Moonbeam Network",
        "url": "https://discord.gg/PfpUATX",
        "description": "Moonbeam (Polkadot) Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Moonbeam Network",
        "url": "https://twitter.com/moonbeamnetwork",
        "description": "Moonbeam (Polkadot) Twitter Account"
      },
      {
        "category": "Community",
        "type": "Github",
        "source": "Moonbeam Network",
        "url": "https://github.com/PureStake/moonbeam",
        "description": "Moonbeam (Polkadot) Github Repository"
      },
      {
        "category": "Community",
        "type": "Medium",
        "source": "Moonbeam Network",
        "url": "https://medium.com/moonbeam-network",
        "description": "Moonbeam (Polkadot) Medium Account"
      },
      {
        "category": "Community",
        "type": "YouTube",
        "source": "Moonbeam Network",
        "url": "https://www.youtube.com/c/MoonbeamNetwork?sub_confirmation=1",
        "description": "Moonbeam (Polkadot) Youtube Channel"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Figment",
        "url": "https://learn.figment.io/tutorials/write-and-deploy-a-smart-contract-on-near",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "moonriver",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Moonscan",
        "url": "https://moonscan.io/",
        "description": "Moonriver (Polkadot) Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "API Documentation",
        "source": "Moonbeam Network",
        "url": "https://docs.moonbeam.network/builders/get-started/eth-compare/transfers-api/",
        "description": "Moonriver (Polkadot) API Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Moonbeam Network",
        "url": "https://docs.moonbeam.network/",
        "description": "Moonriver (Polkadot) Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "Moonbeam Network",
        "url": "https://docs.moonbeam.network/tokens/connect/metamask/",
        "description": "Moonriver (Polkadot) Metamask Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Moonbeam Network",
        "url": "https://discord.gg/PfpUATX",
        "description": "Moonriver (Polkadot) Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Moonbeam Network",
        "url": "https://twitter.com/moonbeamnetwork",
        "description": "Moonriver (Polkadot) Twitter Account"
      },
      {
        "category": "Community",
        "type": "Github",
        "source": "Moonbeam Network",
        "url": "https://github.com/PureStake/moonbeam",
        "description": "Moonriver (Polkadot) Github Repository"
      },
      {
        "category": "Community",
        "type": "Medium",
        "source": "Moonbeam Network",
        "url": "https://medium.com/moonbeam-network",
        "description": "Moonriver (Polkadot) Medium Account"
      },
      {
        "category": "Community",
        "type": "YouTube",
        "source": "Moonbeam Network",
        "url": "https://www.youtube.com/c/MoonbeamNetwork?sub_confirmation=1",
        "description": "Moonriver (Polkadot) Youtube Channel"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "Chainlink",
        "url": "https://faucets.chain.link/",
        "description": "Ethereum Goerli Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Solidity By Example",
        "url": "https://solidity-by-example.org/",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "iotex",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "IOTEXscan",
        "url": "https://iotexscan.io/",
        "description": "IOTEX Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "IOTEXscan",
        "url": "https://testnet.iotexscan.io/",
        "description": "IOTEX Testnet Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "IOTEX",
        "url": "https://docs.iotex.io/",
        "description": "IOTEX Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "IOTEX",
        "url": "https://docs.iotex.io/dapp-development/overview",
        "description": "IOTEX Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "IOTEX",
        "url": "https://docs.iotex.io/get-started/iotex-wallets/metamask",
        "description": "IOTEX Metamask Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "IOTEX",
        "url": "https://discord.com/invite/q5eYde2CU7",
        "description": "IOTEX Discord Server"
      },
      {
        "category": "Community",
        "type": "Forums",
        "source": "IOTEX",
        "url": "https://iotex.io/blog/welcome-iotex-forum/",
        "description": "IOTEX Forums"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "IOTEX",
        "url": "https://faucet.iotex.io/",
        "description": "IOTEX Testnet Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "IOTEX",
        "url": "https://docs.iotex.io/get-started/iotex-dapp-starter",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "evmos",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "EScan",
        "url": "https://evm.evmos.org/",
        "description": "EVMOS Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "EVMOS",
        "url": "https://evm.evmos.dev/",
        "description": "EVMOS Testnet Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "EVMOS",
        "url": "https://docs.evmos.org/",
        "description": "EVMOS Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "EVMOS",
        "url": "https://docs.evmos.org/developers/overview.html",
        "description": "EVMOS Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Ethereum JSON-RPC Server",
        "source": "EVMOS",
        "url": "https://docs.evmos.org/developers/json-rpc/server.html",
        "description": "Ethereum JSON-RPC Server"
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "EVMOS",
        "url": "https://docs.evmos.org/users/wallets/metamask.html",
        "description": "EVMOS Metamask Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "EVMOS",
        "url": "https://discord.com/invite/evmos",
        "description": "EVMOS Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "EVMOS",
        "url": "https://mobile.twitter.com/evmosorg",
        "description": "EVMOS Twitter Account"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "EVMOS",
        "url": "https://www.reddit.com/r/EVMOS/",
        "description": "EVMOS Subreddit"
      },
      {
        "category": "Community",
        "type": "Github",
        "source": "EVMOS",
        "url": "https://github.com/evmos/evmos",
        "description": "EVMOS Github Repository"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "EVMOS",
        "url": "https://faucet.evmos.dev/",
        "description": "EVMOS Testnet Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Solidity By Example",
        "url": "https://solidity-by-example.org/",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "boba",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Boba Chain",
        "url": "https://blockexplorer.boba.network/",
        "description": "Boba Chain Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "Boba Chain",
        "url": "https://testnet.bobascan.com/",
        "description": "Boba Chain Testnet Goerli Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Boba Chain",
        "url": "https://docs.boba.network/",
        "description": "Boba Chain Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Boba Chain",
        "url": "https://docs.boba.network/for-developers",
        "description": "Boba Chain Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Boba Chain",
        "url": "https://discord.com/invite/YFweUKCb8a",
        "description": "Boba Chain Discord Server"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Boba Chain",
        "url": "https://t.me/bobadev",
        "description": "Boba Chain Telegram Feed"
      },
      {
        "category": "Community",
        "type": "Github",
        "source": "Boba Chain",
        "url": "https://github.com/bobanetwork",
        "description": "Boba Chain Github Repository"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "Boba Chain",
        "url": "https://docs.boba.network/for-developers/faucets",
        "description": "Boba Chain Testnet Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Solidity By Example",
        "url": "https://solidity-by-example.org/",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "dogechain",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Dogechain",
        "url": "https://explorer.dogechain.dog/",
        "description": "Dogechain Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "Dogechain",
        "url": "https://explorer-testnet.dogechain.dog/",
        "description": "Dogechain Testnet Goerli Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Dogechain",
        "url": "https://docs.dogechain.dog/docs/overview",
        "description": "Dogechain Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Dogechain",
        "url": "https://docs.dogechain.dog/docs/overview",
        "description": "Dogechain Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Bridge",
        "source": "Dogechain",
        "url": "https://bridge.dogechain.dog/",
        "description": "Dogechain Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Dogechain",
        "url": "https://discord.gg/e9TQwwmF79",
        "description": "Dogechain Discord Server"
      },
      {
        "category": "Community",
        "type": "Github",
        "source": "Dogechain",
        "url": "https://github.com/dogechain-lab/dogechain",
        "description": "Dogechain Github Repository"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "Dogechain",
        "url": "https://faucet.dogechain.dog/",
        "description": "Dogechain Testnet Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Solidity By Example",
        "url": "https://solidity-by-example.org/",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "fuse",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Fuse Explorer",
        "url": "https://explorer.fuse.io/",
        "description": "Fuse Network Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "Fuse Explorer",
        "url": "https://explorer.fusespark.io/",
        "description": "Fuse Spark Testnet Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Fuse Network",
        "url": "https://docs.fuse.io/aboutFuse/about-fuse",
        "description": "Fuse Network Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Fuse Network",
        "url": "https://docs.fuse.io/developers/developers-overview",
        "description": "Fuse Network Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "Fuse Network",
        "url": "https://tutorials.fuse.io/tutorials/network-tutorials/adding-fuse-network-to-metamask",
        "description": "Fuse Network Metamask Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Fuse Network",
        "url": "https://discord.com/invite/dKEverw",
        "description": "Fuse Network Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Fuse Network",
        "url": "https://twitter.com/fuse_network",
        "description": "Fuse Network Twitter Account"
      },
      {
        "category": "Community",
        "type": "YouTube",
        "source": "Fuse Network",
        "url": "https://www.youtube.com/channel/UC7NaJ0UhmyHi5MvZSk61akA",
        "description": "Fuse Network YouTube Account"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "Stakely",
        "url": "https://stakely.io/en/faucet/fuse-blockchain",
        "description": "Fuse Network Testnet Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Hardhat",
        "url": "https://hardhat.org/tutorial/writing-and-compiling-contracts",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "osmosis",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "MintScan",
        "url": "https://www.mintscan.io/osmosis",
        "description": "Fuse Network Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "Osmosis Explorer",
        "url": "https://testnet.osmosis.explorers.guru/",
        "description": "Osmosis Testnet Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Osmosis Labs",
        "url": "https://docs.osmosis.zone/overview",
        "description": "Osmosis Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Osmosis Labs",
        "url": "https://docs.osmosis.zone/osmosis-core",
        "description": "Osmosis Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "Medium",
        "url": "https://medium.com/osmosis-community-updates/configuring-metamask-for-osmosis-bridge-users-3658ac66b87f",
        "description": "Osmosis Metamask Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Osmosis Labs",
        "url": "https://discord.com/invite/osmosis",
        "description": "Osmosis Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Osmosis Labs",
        "url": "https://twitter.com/osmosiszone",
        "description": "Osmosis Twitter Account"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Osmosis Labs",
        "url": "https://t.me/osmosis_chat",
        "description": "Osmosis Telegram Feed"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "Osmosis Labs",
        "url": "https://www.reddit.com/r/OsmosisLab/",
        "description": "Osmosis Subreddit"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "Osmosis Zone",
        "url": "https://faucet.osmosis.zone/#/",
        "description": "Osmosis Testnet Faucet"
      },
      {
        "category": "Cosmos SDK Sample Code",
        "type": "Starter Kit",
        "source": "Cosmos Network",
        "url": "https://tutorials.cosmos.network/tutorials/7-cosmjs/",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "klaytn",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Klaytnscope",
        "url": "https://scope.klaytn.com/",
        "description": "Klaytn Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "Klaytnscope",
        "url": "https://baobab.scope.klaytn.com/",
        "description": "Baobab (Klaytn Testnet) Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Klaytn Foundation",
        "url": "https://docs.klaytn.foundation/",
        "description": "Klaytn Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Klaytn Foundation",
        "url": "https://docs.klaytn.foundation/content/dapp",
        "description": "Klaytn Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "Medium",
        "url": "https://medium.com/klaytn/how-to-add-klaytn-to-metamask-b3bdd970c0e8",
        "description": "Klaytn Metamask Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Klaytn",
        "url": "https://discord.com/invite/hNcrS4BQrm",
        "description": "Klaytn Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Klaytn",
        "url": "https://twitter.com/klaytn_official",
        "description": "Klaytn Twitter Account"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Klaytn",
        "url": "t.me/Klaytn_EN",
        "description": "Klaytn Telegram Feed"
      },
      {
        "category": "Community",
        "type": "Github",
        "source": "Klaytn",
        "url": "https://github.com/klaytn",
        "description": "Klaytn Github Repository"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "Klaytn",
        "url": "https://baobab.wallet.klaytn.foundation/faucet",
        "description": "Baobab (Klaytn Testnet) Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Klaytn Foundation",
        "url": "https://docs.klaytn.foundation/content/dapp/tutorials",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "metis",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Andromeda Explorer",
        "url": "https://andromeda-explorer.metis.io/",
        "description": "Metis Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "Metis",
        "url": "https://goerli.explorer.metisdevops.link/",
        "description": "Stardust (Metis Testnet) Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Metis",
        "url": "https://docs.metis.io/meta/",
        "description": "Metis Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Metis",
        "url": "https://docs.metis.io/dev/",
        "description": "Metis Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "Medium",
        "url": "https://stakingbits.medium.com/setting-up-metamask-for-metis-andromeda-network-5f41d2e55edb",
        "description": "Metis Metamask Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Metis",
        "url": "https://discord.com/invite/RqfEJZXnxd",
        "description": "Metis Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Metis",
        "url": "https://twitter.com/MetisDAO",
        "description": "Metis Twitter Account"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Metis",
        "url": "https://t.me/MetisDAO",
        "description": "Metis Telegram Feed"
      },
      {
        "category": "Community",
        "type": "Github",
        "source": "Metis",
        "url": "https://github.com/MetisProtocol",
        "description": "Metis Github Repository"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "Metis",
        "url": "https://docs.metis.io/dev/get-started/getting-test-tokens",
        "description": "Metis Test Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Solidity By Example",
        "url": "https://solidity-by-example.org/",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "near",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Near Explorer",
        "url": "https://explorer.near.org/",
        "description": "Near Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "Near",
        "url": "https://explorer.testnet.near.org/",
        "description": "Near Terstnet Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Near",
        "url": "https://docs.near.org/",
        "description": "Near Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Near",
        "url": "https://docs.near.org/develop/welcome",
        "description": "Near Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "Medium",
        "url": "https://stakingbits.medium.com/setting-up-metamask-for-aurora-near-protocol-6ff5289344f3",
        "description": "Near Metamask Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Near",
        "url": "https://near.chat/",
        "description": "Near Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Near",
        "url": "https://twitter.com/nearprotocol",
        "description": "Near Twitter Account"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Near",
        "url": "https://t.me/cryptonear",
        "description": "Near Telegram Feed"
      },
      {
        "category": "Community",
        "type": "Github",
        "source": "Near",
        "url": "https://github.com/near",
        "description": "Near Github Repository"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "Near",
        "url": "https://awesomenear.com/near-testnet-faucet",
        "description": "Metis Test Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Near",
        "url": "https://docs.near.org/tools/near-sdk-js",
        "description": "Rust & Javascript SDK's"
      }
    ]
  },
  {
    "network": "swimmer",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Swimmer Network",
        "url": "https://explorer.swimmer.network/",
        "description": "Swimmer Network Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "Swimmer Network",
        "url": "https://play-explorer.swimmer.network/",
        "description": "Swimmer Network Testnet Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Swimmer Network",
        "url": "https://docs.swimmer.network/",
        "description": "Swimmer Network"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Swimmer Network",
        "url": "https://docs.swimmer.network/ecosystem/developer-guides",
        "description": "Swimmer Developers Guide"
      },
      {
        "category": "Documentation",
        "type": "Metamask Guide",
        "source": "Play2Moon",
        "url": "https://play2moon.com/how-to-set-up-metamask-wallet-for-swimmer-network/",
        "description": "SwimmerMetamask Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Swimmer Network",
        "url": "https://discord.com/invite/BWn5vvrmuW",
        "description": "Swimmer Network Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Swimmer Network",
        "url": "https://twitter.com/swimmer_network?lang=en",
        "description": "Swimmer Network Twitter Account"
      },
      {
        "category": "Community",
        "type": "Medium",
        "source": "Swimmer Network",
        "url": "https://medium.com/@swimmer_network",
        "description": "Swimmer Network Medium Account"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "Swimmer Network",
        "url": "https://faucet.swimmer.network/",
        "description": "Swimmer Network Test Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Solidity By Example",
        "url": "https://solidity-by-example.org/",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "starknet",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Starkscan",
        "url": "https://starkscan.co/",
        "description": "Starknet Block Explorer"
      },
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "Starkscan",
        "url": "https://testnet.starkscan.co/",
        "description": "Starknet Testnet Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Starkware",
        "url": "https://docs.starkware.co/starkex/index.html",
        "description": "Starknet Docs"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Starkware",
        "url": "https://starknet.io/docs/",
        "description": "Starknet Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Starkware",
        "url": "https://discord.com/invite/QypNMzkHbc",
        "description": "Starknet Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Starkware",
        "url": "https://twitter.com/StarkWareLtd",
        "description": "Starknet Twitter Account"
      },
      {
        "category": "Community",
        "type": "Forum",
        "source": "Starkware",
        "url": "https://community.starknet.io/",
        "description": "Starknet Community Forums"
      },
      {
        "category": "Faucet",
        "type": "Testnet",
        "source": "Starkware",
        "url": "https://faucet.goerli.starknet.io/",
        "description": "Starknet Goerli Test Faucet"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Solidity By Example",
        "url": "https://solidity-by-example.org/",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "solana",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Solana",
        "url": "https://explorer.solana.com/",
        "description": "Solana Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Solana",
        "url": "https://docs.solana.com/",
        "description": "Solana Docs"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Solana",
        "url": "https://docs.solana.com/developers",
        "description": "Solana Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Solana",
        "url": "https://discord.com/invite/pquxPsq",
        "description": "Solana Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Solana",
        "url": "https://twitter.com/solana",
        "description": "Solana Twitter Account"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "Solana",
        "url": "https://www.reddit.com/r/solana/",
        "description": "Solana Reddit Forums"
      },
      {
        "category": "Sample Code",
        "type": "Program Examples",
        "source": "Solana",
        "url": "https://docs.solana.com/developing/on-chain-programs/examples#helloworld",
        "description": "Solana program examples"
      }
    ]
  },
  {
    "network": "fantom",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "FtmScan",
        "url": "https://ftmscan.com/",
        "description": "Solana Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Fantom Foundation",
        "url": "https://fantom.foundation/intro-to-fantom/",
        "description": "Fantom Docs"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Fantom Foundation",
        "url": "https://docs.fantom.foundation/",
        "description": "Fantom Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Fantom Foundation",
        "url": "http://chat.fantom.network/",
        "description": "Fantom Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Fantom Foundation",
        "url": "https://twitter.com/FantomFDN",
        "description": "FantomFDN Twitter Account"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "Fantom Foundation",
        "url": "https://www.reddit.com/r/FantomFoundation/",
        "description": "Fantom Reddit Forums"
      },
      {
        "category": "Community",
        "type": "YouTube",
        "source": "Fantom Foundation",
        "url": "https://www.youtube.com/channel/UC0T0nLjwUaLDiSONLBxY8IQ",
        "description": "Fantom Reddit Forums"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Fantom Foundation",
        "url": "https://t.me/Fantom_English",
        "description": "Fantom Telegram Forums"
      },
      {
        "category": "Community",
        "type": "GitHub",
        "source": "Fantom Foundation",
        "url": "https://fantom-lang.org/",
        "description": "Fantom Telegram Forums"
      },
      {
        "category": "Sample Code",
        "type": "Program Examples",
        "source": "Fantom",
        "url": "https://fantom-lang.org/",
        "description": "Fantom program examples"
      }
    ]
  },
  {
    "network": "binance",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "BSC Scan",
        "url": "https://bscscan.com/",
        "description": "Binance Smart Chain Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "BNB Blockchain",
        "url": "https://docs.bnbchain.org/docs/learn/intro",
        "description": "BSC Docs"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "BNB Blockchain",
        "url": "https://docs.bnbchain.org/docs/BSCmainnet",
        "description": "BSC Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Binance",
        "url": "https://discord.gg/jE4wt8g2H2",
        "description": "Binance Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Binance Foundation",
        "url": "https://twitter.com/binance",
        "description": "Binance Twitter Account"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "Binance",
        "url": "https://www.reddit.com/r/binance",
        "description": "Binance Reddit Forums"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Binance",
        "url": "https://t.me/BinanceExchange",
        "description": "Binance Telegram Forums"
      },
      {
        "category": "Sample Code",
        "type": "Program Examples",
        "source": "Solidity by Example",
        "url": "https://solidity-by-example.org/",
        "description": "Binance program examples"
      }
    ]
  },
  {
    "network": "bsc-archival",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "BSC Scan",
        "url": "https://bscscan.com/",
        "description": "Binance Smart Chain Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "BNB Blockchain",
        "url": "https://docs.bnbchain.org/docs/learn/intro",
        "description": "BSC Docs"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "BNB Blockchain",
        "url": "https://docs.bnbchain.org/docs/BSCmainnet",
        "description": "BSC Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Binance",
        "url": "https://discord.gg/jE4wt8g2H2",
        "description": "Binance Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Binance Foundation",
        "url": "https://twitter.com/binance",
        "description": "Binance Twitter Account"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "Binance",
        "url": "https://www.reddit.com/r/binance",
        "description": "Binance Reddit Forums"
      },
      {
        "category": "Community",
        "type": "Telegram",
        "source": "Binance",
        "url": "https://t.me/BinanceExchange",
        "description": "Binance Telegram Forums"
      },
      {
        "category": "Sample Code",
        "type": "Program Examples",
        "source": "Solidity by Example",
        "url": "https://solidity-by-example.org/",
        "description": "Binance program examples"
      }
    ]
  },
  {
    "network": "polygon-archival",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "PolygonScan",
        "url": "https://polygonscan.com/",
        "description": "Polygon (MATIC) Blockchain Explorer"
      },
      {
        "category": "Documentation",
        "type": "Protocol Documentation",
        "source": "Polygon Technology",
        "url": "https://docs.polygon.technology/",
        "description": "Polygon Technology Documentation"
      },
      {
        "category": "Documentation",
        "type": "FAQ",
        "source": "Polygon Technology",
        "url": "https://docs.polygon.technology/docs/faq/general-faq/",
        "description": "General FAQ"
      },
      {
        "category": "API Documentation",
        "type": "Polygon PoS API",
        "source": "Polygon Technology",
        "url": "https://docs.polygon.technology/docs/category/maticjs",
        "description": "Matic.js Documentation"
      },
      {
        "category": "API Documentation",
        "type": "Block Explorer API",
        "source": "PolygonScan",
        "url": "https://docs.polygonscan.com/v/mumbai-polygonscan/",
        "description": "Mumbai PolygonScan API Documentation"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Discord",
        "url": "https://discord.com/invite/0xPolygon",
        "description": "Polygon Discord Server"
      },
      {
        "category": "Community",
        "type": "Forum",
        "source": "Polygon Technology",
        "url": "https://forum.polygon.technology/",
        "description": "Polygon Community Forum"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "Polygon Technology",
        "url": "https://www.reddit.com/r/0xPolygon/",
        "description": "r/0xPolygon"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Polygon Academy",
        "url": "https://github.com/Polygon-Academy/starter-kits",
        "description": "Start building full stack dApps fast"
      }
    ]
  },
  {
    "network": "fuse",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Fuse",
        "url": "https://explorer.fuse.io/",
        "description": "Fuse Blockchain Explorer"
      },
      {
        "category": "Documentation",
        "type": "Protocol Documentation",
        "source": "Fuse",
        "url": "https://docs.fuse.io/aboutFuse/about-fuse",
        "description": "Fuse Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developer Documentation",
        "source": "Fuse",
        "url": "https://docs.fuse.io/developers/developers-overview",
        "description": "Fuse Developer Documentation"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Fuse",
        "url": "https://t.co/mwN4eZBiLh",
        "description": "Fuse Discord Server"
      },
      {
        "category": "Community",
        "type": "YouTube",
        "source": "Fuse",
        "url": "https://www.youtube.com/channel/UC7NaJ0UhmyHi5MvZSk61akA",
        "description": "Fuse YouTube Channel"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Fuse",
        "url": "https://twitter.com/fuse_network",
        "description": "Fuse Twitter Feed"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Hardhat",
        "url": "https://hardhat.org/tutorial/writing-and-compiling-contracts",
        "description": "Writing and compiling smart contracts"
      }
    ]
  },
  {
    "network": "fuse-archival",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Fuse",
        "url": "https://explorer.fuse.io/",
        "description": "Fuse Blockchain Explorer"
      },
      {
        "category": "Documentation",
        "type": "Protocol Documentation",
        "source": "Fuse",
        "url": "https://docs.fuse.io/aboutFuse/about-fuse",
        "description": "Fuse Documentation"
      },
      {
        "category": "Documentation",
        "type": "Developer Documentation",
        "source": "Fuse",
        "url": "https://docs.fuse.io/developers/developers-overview",
        "description": "Fuse Developer Documentation"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Fuse",
        "url": "https://t.co/mwN4eZBiLh",
        "description": "Fuse Discord Server"
      },
      {
        "category": "Community",
        "type": "YouTube",
        "source": "Fuse",
        "url": "https://www.youtube.com/channel/UC7NaJ0UhmyHi5MvZSk61akA",
        "description": "Fuse YouTube Channel"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Fuse",
        "url": "https://twitter.com/fuse_network",
        "description": "Fuse Twitter Feed"
      },
      {
        "category": "Sample Code",
        "type": "Starter Kit",
        "source": "Hardhat",
        "url": "https://hardhat.org/tutorial/writing-and-compiling-contracts",
        "description": "Writing and compiling smart contracts"
      }
    ]
  },
  {
    "network": "optimism",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Optimism.io",
        "url": "https://optimistic.etherscan.io/",
        "description": "Optimism Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "Optimism.io",
        "url": "https://community.optimism.io/",
        "description": "Optimism Docs"
      },
      {
        "category": "Documentation",
        "type": "Developers Guide",
        "source": "Optimism.io",
        "url": "https://community.optimism.io/docs/developers/",
        "description": "Optimism Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "Optimism.io",
        "url": "https://discord-gateway.optimism.io/",
        "description": "Optimism Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "Optimism.io",
        "url": "https://twitter.com/optimismFND",
        "description": "OptimismFND Twitter Account"
      },
      {
        "category": "Sample Code",
        "type": "Program Examples",
        "source": "Optmism.io",
        "url": "https://github.com/ethereum-optimism/optimism-tutorial/tree/main/sdk-view-tx",
        "description": "Optimism program examples"
      }
    ]
  },
  {
    "network": "dfkchain",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "AvaScan",
        "url": "https://avascan.info/blockchain/dfk/home",
        "description": "DFKChain Block Explorer"
      },
      {
        "category": "Documentation",
        "type": "Documentation",
        "source": "DeFi Kingdoms",
        "url": "https://docs.defikingdoms.com/how-defi-kingdoms-works/defi-kingdoms-blockchain",
        "description": "DeFi Kingdoms Blockchain Docs"
      },
      {
        "category": "Documentation",
        "type": "Avax Subnet Developer Documentation",
        "source": "Avax.Network",
        "url": "https://docs.avax.network/subnets",
        "description": "Avax Subnet Developer Documentation Developers Guide"
      },
      {
        "category": "Community",
        "type": "Discord",
        "source": "DeFi Kingdoms",
        "url": "https://discord.com/invite/defikingdoms",
        "description": "DeFi Kingdoms Discord Server"
      },
      {
        "category": "Community",
        "type": "Twitter",
        "source": "DeFi Kingdoms",
        "url": "https://twitter.com/DefiKingdoms",
        "description": "DeFiKingdoms Twitter Account"
      },
      {
        "category": "Community",
        "type": "Reddit",
        "source": "DeFi Kingdoms",
        "url": "https://www.reddit.com/r/DefiKingdoms/",
        "description": "DeFi Kingdoms Reddit Forums"
      },
      {
        "category": "Sample Code",
        "type": "Program Examples",
        "source": "Avax.Network",
        "url": "https://codesandbox.io/examples/package/avalanche",
        "description": "Avalanche program examples"
      }
    ]
  }
];