import db from "../models/index.js";
const scheduledJobs = db.scheduledjobs;
import path from "path";
import logger from "../services/bscLogger.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);

// Retrieve all Scheduled Jobs of a Client from the database.

const scheduledJobsController = {
  findAll: (req, res) => {
    logger.debug("started findAll()", { module: thisModule });
    const clientid = req.params.clientid;
    scheduledJobs
      .find({ "data.clientId": clientid, nextRunAt: { $ne: null } })
      .then((data) => {
        logger.debug("finished findAll()", { module: thisModule }, { response: data });
        res.send(data);
      })
      .catch((err) => {
        logger.error("findAll()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while retrieving Client Scheduled Jobs." });
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Client Scheduled Jobs.",
        });
      });
  },

  // Find a single Client Scheduled Job with an id
  findOne: (req, res) => {
    logger.debug("started findOne()", { module: thisModule });
    const id = req.params.id;
    scheduledJobs
      .findById(id)
      .then((data) => {
        if (!data) {
          logger.error("findOne()", { module: thisModule }, { error: "Did not find Client Scheduled Job with id " + id });
          res.status(404).send({ message: "Did not find Client Scheduled Job with id " + id });
        } else {
          logger.debug("finished findOne()", { module: thisModule }, { response: data });
          res.send(data);
        }
      })
      .catch((err) => {
        logger.error("findOne()", { module: thisModule }, { error: err.message ? err.message : "Error retrieving Client Scheduled Job with id=" + id });
        res.status(500).send({ message: "Error retrieving Client Scheduled Job with id=" + id });
      });
  },

  // Delete a Client Scheduled Job with the specified id in the request
  delete: (req, res) => {
    logger.debug("started delete()", { module: thisModule });
    const id = req.params.id;

    scheduledJobs
      .findByIdAndRemove(id)
      .then((data) => {
        if (!data) {
          logger.error("delete()", { module: thisModule }, { error: `Cannot delete Client Scheduled Job with id=${id}.` });
          res.status(404).send({
            message: `Cannot delete Client Scheduled Job with id=${id}.`,
          });
        } else {
          logger.debug("finished delete()", { module: thisModule }, { response: data });
          res.send({
            message: "Client Scheduled Job was deleted successfully!",
          });
        }
      })
      .catch((err) => {
        logger.error("delete()", { module: thisModule }, { error: err.message ? err.message : "Could not delete Client Scheduled Job with id=" + id });
        res.status(500).send({
          message: "Could not delete Client Scheduled Job with id=" + id,
        });
      });
  },

  // Delete all Client Scheduled Jobs from the database.
  deleteAll: (req, res) => {
    logger.debug("started deleteAll()", { module: thisModule });
    const clientid = req.params.clientid;

    scheduledJobs
      .deleteMany({ "data.clientId": clientid })
      .then((data) => {
        logger.debug("finished deleteAll()", { module: thisModule }, { response: data });
        res.send({
          message: `${data.deletedCount} Client Scheduled Jobs were deleted successfully!`,
        });
      })
      .catch((err) => {
        logger.error("deleteAll()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while removing all client Scheduled Jobs." });
        res.status(500).send({
          message: err.message || "Some error occurred while removing all client Scheduled Jobs.",
        });
      });
  },
};

export default scheduledJobsController;
