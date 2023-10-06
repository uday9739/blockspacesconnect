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
    "network": "polygon-mumbai",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Testnet",
        "source": "PolygonScan",
        "url": "https://mumbai.polygonscan.com/",
        "description": "Testnet Polygon (MATIC) Blockchain Explorer"
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
    "network": "polygon",
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
    "network": "ethereum-goerli",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Testnet",
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
        "category": "Faucet",
        "type": "Testnet",
        "source": "Chainlink",
        "url": "https://faucets.chain.link/",
        "description": "Ethereum Goerli Faucet"
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
    "network": "ethereum",
    "resources": [
      {
        "category": "Block Explorer",
        "type": "Mainnet",
        "source": "Etherscan",
        "url": "https://etherscan.io/",
        "description": "Ethereum Blockchain Explorer"
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
        "source": "Polygon Academy",
        "url": "https://github.com/Polygon-Academy/starter-kits",
        "description": "Start building full stack dApps fast"
      }
    ]
  }
];