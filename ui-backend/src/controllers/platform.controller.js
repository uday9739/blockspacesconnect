import mongoose from 'mongoose';
import axios from "axios";

const vaultApiUrl = process.env.VAULT_API_URL;

async function  assessDatabaseStatus() {
    mongoose
      .connect(process.env.MONGO_CONNECT_STRING)
      .then(() => {
        return  "normal";
      })
      .catch((err) => {
        console.log({ message: err.message || "Some error occurred while checking database." });
        return "err.message";
      });
}

async function getbackendStatus() {
  return new Promise(res => {
    setTimeout(() => {
      res("normal");
    }, 100);
  });
}
async function getfrontendStatus() {
  return new Promise(res => {
    setTimeout(() => {
      res("normal");
    }, 100);
  });
}
async function getDatabaseStatus() {
  return mongoose
    .connect(process.env.MONGO_CONNECT_STRING)
    .then(() => {
      return "normal";
    })
    .catch((err) => {
      console.log({ message: err.message || "Some error occurred while checking database." });
      return err.message;
    });
}


async function getVaultStatus() {

  const authPath = "/sys/health";
  //TODO: `where should we store this token?
  let vaultToken = "s.HLNtIYMYgzQHA3cNEJnwIf62";

  const requestOptions = {
    baseURL: vaultApiUrl,
    url: authPath,
    method: "get",
    headers: {
      "X-Vault-Token": vaultToken,
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  };
  return axios
    .request(requestOptions)
    .then(async (response) => {
      if (response.data) {
        console.log(response.data);
        //TODO: `need to evaluate the stauts response from API in more detail
        if (response.data['initialized'] == true) {
          return "normal";
        }
        else{
          return "down";
        }
      } else {
        throw new Error("failed to get vault status");
      }
    })
    .catch((err) => {
      throw err;
    });
}

async function assessSystemStatus(req,res) {
  try {
    let statusResponse = {
      timestamp: Date.now(),
      adminMessage: `All systems are operational as of ${Date.now()}`,
      systemStatus: "normal",
      frontendStatus: "normal",
      backendStatus: "normal",
      vaultStatus: "normal",
      databaseStatus: "normal"
    };
    let statuses = [];

    statusResponse.frontendStatus = await getfrontendStatus();
    statuses.push(statusResponse.frontendStatus);
    statusResponse.backendStatus = await getbackendStatus();
    statuses.push(statusResponse.backendStatus);
    statusResponse.vaultStatus = await getVaultStatus();
    statuses.push(statusResponse.vaultStatus);
    statusResponse.databaseStatus = await getDatabaseStatus();
    statuses.push(statusResponse.databaseStatus);

    statuses.forEach((status) =>{
      if(status != "normal"){
        statusResponse.systemStatus = "down";
        statusResponse.adminMessage = `The system is down as of ${Date.now()}`;
      }
    })

    res.status(200).send(statusResponse);

  }catch (err){
    console.log({ message: err.message || "Some error occurred while assessing System Status." });
  }
}

export class platformController{
  constructor() {
  }
  platformDescription(req, res) {
    try {
      res.status(200).send({
        timestamp:Date.now(),
        adminMessage: `Latest platform configuraiotn as of ${Date.now()}`,
        environment: "development",
        systemVersion: "version 0.1",
        frontendVersion: "version 0.1",
        backendVersion: "version 0.1",
        vaultVersion: "version 0.1",
        databaseVersion: "version 0.1"
      });
    } catch (err) {
      res.status(500).send({ message: err.message || "Some error occurred while running test." });
    }
  }

  status(req, res) {
    try {
       assessSystemStatus(req,res);
    } catch (err) {
      res.status(500).send({ message: err.message || "Some error occurred while running test." });
    }
  }
}
