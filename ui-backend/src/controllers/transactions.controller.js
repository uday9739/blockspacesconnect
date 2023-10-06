import db from "../models/index.js";
//import {moduleReport} from "../../../backend/src/helpers/moduleReporter"
import {logger, transactionLogger} from "../services/bscLogger.js";

//TODO integrate module reports
//TODO standardize API responses
//

db.mongoose
  .connect(process.env.MONGO_CONNECT_STRING)
  .then(() => {
  })
  .catch((err) => {
    process.exit();
  });

export class transactionsController{
  constructor() {
  }
  stubTransaction(req, res) {
    try {
      res.status(200).send({transactions: [{id: 1}, {id: 2}]});
    } catch (err) {
      res.status(500).send({message: err.message || "Some error occurred while running test."});
    }
  }
  readTransaction(req, res) {
    try {
      //TODO handle insufficient parameters
      let transactionId = req.params['transactionId']
      db.Transactions.findOne({transactionId:transactionId}).then( function (doc, err){
        res.status(200).send(doc);
      });
    } catch (err) {
      res.status(500).send({ message: err.message || "Some error occurred while running test." });
    }
  }
  updateTransaction(req, res) {
    try {
      //TODO handle insufficient parameters
      let transactionId = req.params['transactionId'];
      let status = req.params['status'];
      let completedOn = (status === 'completed') ? req.params['completedOn'] : "";

      db.Transactions.updateOne({transactionId:transactionId},{status:status, completedOn: completedOn}).then( function (doc, err){
        res.status(200).send(doc);
      });
    } catch (err) {
      //logger.error("create()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while creating the System." });
      res.status(500).send({ message: err.message || "Some error occurred while running test." });
    }
  }
  writeTransaction(req, res) {
    try {
      //TODO handle insufficient parameters
      transactionLogger.level = "debug";
      transactionLogger.debug(`Start processing Write Transaction request`,{request:req.body});
      let transaction = new db.Transactions(req.body);
      transaction.save().then( function (doc, err){
        transactionLogger.debug(`Finish processing Write Transaction request`,{response:doc});
      });

      res.status(200).send({data :"transaction was written"});
    } catch (err) {
      res.status(500).send({ message: err.message || "Some error occurred while running test." });
    }
  }
}

export default transactionsController;

