/* eslint-disable linebreak-style */
import db from "../models/index.js";
// eslint-disable-next-line no-unused-vars
import scheduledJobsController from "./scheduledjobs.controller.js";
import logger from "../services/bscLogger.js";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);

const schedulerDefinition = db.schedulerdefinition;

// Create and Save a new Client Scheduler Definition

const schedulerDefintionController = {
  create: (req, res) => {
    logger.debug("started create()", { module: thisModule });
    // console.log("schedulerDefinition is " + schedulerDefinition);

    // Create a Scheduler Definition
    const schedulerdefinition = new schedulerDefinition({
      clientId: req.body.clientId,
      startDate: req.body.startDate,
      startTimeInMins: req.body.startTimeInMins,
      endDate: req.body.endDate,
      endTime: req.body.endTime,
      dwmFlag: req.body.dwmFlag,
      wAllDays: req.body.wAllDays,
      wDays: req.body.wDays,
      mAllMonths: req.body.mAllMonths,
      mMonths: req.body.mMonths,
      mDays: req.body.mDays,
      mWeekDays: req.body.mWeekDays,
      repeatTaskEveryInMins: req.body.repeatTaskEveryInMins,
      forDurationInDayInMins: req.body.forDurationInDayInMins,
      blockFlowId: req.body.blockFlowId,
      initialData: req.body.initialData,
      active: req.body.active,
    });

    // console.log("schedulerdefinition is " + schedulerdefinition);

    // Save Scheduler Definition in the database
    schedulerdefinition
      .save(schedulerdefinition)
      .then((data) => {
        logger.debug("finished create()", { module: thisModule }, { response: data });
        res.send(data);
      })
      .catch((err) => {
        logger.error("create()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while creating the Client Scheduler Definition." });
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Client Scheduler Definition.",
        });
      });
  },

  // Retrieve all Scheduler Definitions of a Client from the database.
  findAll: (req, res) => {
    logger.debug("started findAll()", { module: thisModule });
    const clientid = req.params.clientid;
    schedulerDefinition
      .find({ clientId: clientid })
      .then((data) => {
        logger.debug("finished findAll()", { module: thisModule }, { response: data });
        res.send(data);
      })
      .catch((err) => {
        logger.error("findAll()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while retrieving Client Scheduler Definitions." });
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Client Scheduler Definitions.",
        });
      });
  },

  // Find a single Client Scheduler Definition with an id
  findOne: (req, res) => {
    logger.debug("started findOne()", { module: thisModule });
    const id = req.params.id;

    schedulerDefinition
      .findById(id)
      .then((data) => {
        if (!data) {
          logger.error("findOne()", { module: thisModule }, { error: "Did not find Client Scheduler Definition with id " + id });
          res.status(404).send({ message: "Did not find Client Scheduler Definition with id " + id });
        } else {
          logger.debug("finished findOne()", { module: thisModule }, { response: data });
          res.send(data);
        }
      })
      .catch((err) => {
        logger.error("findOne()", { module: thisModule }, { error: err.message ? err.message : "Error retrieving Client Scheduler Definition with id=" + id });
        res.status(500).send({ message: "Error retrieving Client Scheduler Definition with id=" + id });
      });
  },

  // Update a Client Scheduler Definition by the id in the request
  update: (req, res) => {
    logger.debug("started update()", { module: thisModule });
    const id = req.params.id;

    schedulerDefinition
      .findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          logger.error("update()", { module: thisModule }, { error: `Cannot update Client Scheduler Definition with clientid=${id}. Maybe Connector was not found!` });
          res.status(404).send({
            message: `Cannot update Client Scheduler Definition with clientid=${id}. Maybe Connector was not found!`,
          });
        } else {
          logger.debug("finished update()", { module: thisModule }, { response: data });
          res.send({ message: "Client Scheduler Definition was updated successfully." });
        }
      })
      .catch((err) => {
        logger.error("update()", { module: thisModule }, { error: err.message ? err.message : "Error updating Client Scheduler Definition with id=" + id });
        res.status(500).send({
          message: "Error updating Client Scheduler Definition with id=" + id,
        });
      });
  },

  // Delete a Client Scheduler Definition with the specified id in the request
  delete: (req, res) => {
    logger.debug("started delete()", { module: thisModule });
    const id = req.params.id;

    schedulerDefinition
      .findByIdAndRemove(id)
      .then((data) => {
        if (!data) {
          logger.error("delete()", { module: thisModule }, { error: `Cannot delete Client Scheduler Definition with id=${id}. Maybe Client Connector was not found!` });
          res.status(404).send({
            message: `Cannot delete Client Scheduler Definition with id=${id}. Maybe Client Connector was not found!`,
          });
        } else {
          logger.debug("finished delete()", { module: thisModule }, { response: data });
          res.send({
            message: "Client Scheduler Definition was deleted successfully!",
          });
        }
      })
      .catch((err) => {
        logger.error("delete()", { module: thisModule }, { error: err.message ? err.message : "Could not delete Client Scheduler Definition with id=" + id });
        res.status(500).send({
          message: "Could not delete Client Scheduler Definition with id=" + id,
        });
      });
  },

  // Delete all Client Scheduler Definition from the database.
  deleteAll: (req, res) => {
    logger.debug("started deleteAll()", { module: thisModule });
    const clientid = req.params.clientid;
    schedulerDefinition
      .deleteMany({ clientId: clientid })
      .then((data) => {
        logger.debug("finished deleteAll()", { module: thisModule }, { response: data });
        res.send({
          message: `${data.deletedCount} Client Scheduler Definition were deleted successfully!`,
        });
      })
      .catch((err) => {
        logger.error("deleteAll()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while removing all client Scheduler Definitions." });
        res.status(500).send({
          message: err.message || "Some error occurred while removing all client Scheduler Definitions.",
        });
      });
  },
};

export default schedulerDefintionController;
