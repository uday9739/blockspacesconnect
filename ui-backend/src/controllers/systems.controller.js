import Models from "../models/index.js";
const { System } = Models;

import path from "path";
import { logger } from "../services/bscLogger.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);


const systemController = {
  // Create a System
  create: (req, res) => {
    logger.debug("started create()", { module: thisModule });
    const system = new System({
      id: req.body.id,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      logo: req.body.logo,
      icon: req.body.icon,
    });

    // Save System in the database
    system
      .save()
      .then((data) => {
        logger.debug("finished create()", { module: thisModule }, { response: data });
        res.send(data);
      })
      .catch((err) => {
        logger.error("create()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while creating the System." });
        res.status(500).send({
          message: err.message || "Some error occurred while creating the System.",
        });
      });
  },

  // Retrieve all Systems from the database.
  findAll: (req, res) => {
    logger.debug("started findAll()", { module: thisModule });
    System.find()
      .then((data) => {
        logger.debug("finished findAll()", { module: thisModule }, { response: data });
        res.send(data);
      })
      .catch((err) => {
        logger.error("findAll()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while retrieving Systems." });
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Systems.",
        });
      });
  },

  // Find a single System with an id
  findOne: (req, res) => {
    logger.debug("started findOne()", { module: thisModule });
    const id = req.params.id;

    System.find({ id: id })
      .exec()
      .then((data) => {
        if (!data) {
          logger.error("findOne()", { module: thisModule }, { error: "Did not find a System with id " + id });
          res.status(404).send({ message: "Did not find a System with id " + id });
        } else if (!Array.isArray(data)) {
          logger.error("findOne()", { module: thisModule }, { error: "Did not find a System with id " + id });
          res.status(404).send({ message: "Did not find a System with id " + id });
        } else if (Array.isArray(data) && data.length < 1) {
          logger.error("findOne()", { module: thisModule }, { error: "Did not find a System with id " + id });
          res.status(404).send({ message: "Did not find a System with id " + id });
        } else if (Array.isArray(data) && data.length > 1) {
          logger.error("findOne()", { module: thisModule }, { error: "Found more than one System with id " + id });
          res.status(404).send({ message: "Found more than one System with id " + id });
        } else {
          logger.debug("finished findOne()", { module: thisModule }, { response: data[0] });
          res.send(data[0]);
        }
      })
      .catch((err) => {
        logger.error("findOne()", { module: thisModule }, { error: err.message ? err.message : "Error retrieving System with id=" + id });
        res.status(500).send({ message: "Error retrieving System with id=" + id });
      });
  },

  // Update a System by the id in the request
  update: (req, res) => {
    logger.debug("started update()", { module: thisModule });
    const id = req.params.id;

    System.findOneAndUpdate({ id: id }, req.body, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          logger.error("update()", { module: thisModule }, { error: `Cannot update System with id=${id}. Maybe System was not found!` });
          res.status(404).send({
            message: `Cannot update System with id=${id}. Maybe System was not found!`,
          });
        } else {
          logger.debug("finished update()", { module: thisModule }, { response: data });
          res.send({ message: "System was updated successfully." });
        }
      })
      .catch((err) => {
        logger.error("update()", { module: thisModule }, { error: err.message ? err.message : "Error updating System with id=" + id });
        res.status(500).send({
          message: "Error updating System with id=" + id,
        });
      });
  },

  // Delete a System with the specified id in the request
  delete: (req, res) => {
    logger.debug("started delete()", { module: thisModule });
    const id = req.params.id;

    System.findOneAndRemove({ id: id })
      .then((data) => {
        if (!data) {
          logger.error("delete()", { module: thisModule }, { error: `Cannot delete System with id=${id}. Maybe System was not found!` });
          res.status(404).send({
            message: `Cannot delete System with id=${id}. Maybe System was not found!`,
          });
        } else {
          logger.debug("finished delete()", { module: thisModule });
          res.send({
            message: "System was deleted successfully!",
          });
        }
      })
      .catch((err) => {
        logger.error("delete()", { module: thisModule }, { error: err.message ? err.message : "Could not delete System with id=" + id });
        res.status(500).send({
          message: "Could not delete System with id=" + id,
        });
      });
  },

  // Delete all Systems from the database.
  deleteAll: (req, res) => {
    logger.debug("started deleteAll()", { module: thisModule });
    System.deleteMany({})
      .then((data) => {
        logger.debug("finished deleteAll()", { module: thisModule }, { response: data });
        res.send({
          message: `${data.deletedCount} Systems were deleted successfully!`,
        });
      })
      .catch((err) => {
        logger.error("deleteAll()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while removing all systems." });
        res.status(500).send({
          message: err.message || "Some error occurred while removing all systems.",
        });
      });
  },
};

export default systemController;
