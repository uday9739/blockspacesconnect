/* eslint-disable linebreak-style,prefer-const */
import $RefParser from "@apidevtools/json-schema-ref-parser";
import db from "../models/index.js";
const { Connectors } = db;

import logger from "../services/bscLogger.js";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const thisModule = path.basename(__filename);


const prepareParameter = (name, parameter) => {
  logger.debug("started prepareParameter()", { module: thisModule });
  const types = {
    array: function (name, parameter) {
      let preparedParameter = {};
      preparedParameter.name = name.replace("[]", "");
      preparedParameter.description = parameter.description || preparedParameter.name;
      preparedParameter.in = parameter.in || "";
      preparedParameter.type = parameter.schema ? parameter.schema.type : parameter.type;
      preparedParameter.required = parameter.required || false;
      preparedParameter.items = {};
      preparedParameter.items.item = prepareParameter("item", parameter.schema ? parameter.schema.items || parameter.items : parameter.items);
      return preparedParameter;
    },
    object: function (name, parameter) {
      let preparedParameter = {};
      preparedParameter.name = name;
      preparedParameter.description = parameter.description || preparedParameter.name;
      preparedParameter.in = parameter.in || "";
      preparedParameter.type = parameter.schema ? parameter.schema.type : parameter.type;
      preparedParameter.required = parameter.required && !Array.isArray(parameter.required) ? parameter.required : false;
      preparedParameter.properties = {};
      if (parameter.properties) {
        Object.keys(parameter.properties).map((property) => {
          // console.log('type object property', property, parameter.properties[property]);
          preparedParameter.properties[property] = prepareParameter(property, parameter.properties[property]);
        });
      }
      return preparedParameter;
    },
    string: function (name, parameter) {
      let preparedParameter = {};
      preparedParameter.name = name;
      preparedParameter.description = parameter.description || preparedParameter.name;
      preparedParameter.in = parameter.in || "";
      preparedParameter.type = parameter.schema ? parameter.schema.type : parameter.type;
      preparedParameter.required = parameter.required || false;
      preparedParameter.format = parameter.schema?.format || "";
      if (parameter.example) {
        preparedParameter.example = parameter.example;
      } else if (parameter.schema && parameter.schema.format == "date") {
        preparedParameter.example = new Date.now().toJSON().substring(0, 10);
      } else if (parameter.schema && parameter.schema.format == "date-time") {
        preparedParameter.example = new Date.now().toJSON();
      } else if (parameter.schema && parameter.schema.format == "uuid") {
        preparedParameter.example = "1234-5678-9ABC-DEFG-HIJK";
      } else if (parameter.schema && parameter.schema.format == "email") {
        preparedParameter.example = "example@domain.com";
      } else {
        preparedParameter.example = "Example " + name;
      }
      return preparedParameter;
    },
    number: function (name, parameter) {
      let preparedParameter = {};
      preparedParameter.name = name;
      preparedParameter.description = parameter.description || preparedParameter.name;
      preparedParameter.in = parameter.in || "";
      preparedParameter.type = parameter.schema ? parameter.schema.type : parameter.type;
      preparedParameter.required = parameter.required || false;
      preparedParameter.example = parameter.example || 1234.56;
      return preparedParameter;
    },
    integer: function (name, parameter) {
      let preparedParameter = {};
      preparedParameter.name = name;
      preparedParameter.description = parameter.description || preparedParameter.name;
      preparedParameter.in = parameter.in || "";
      preparedParameter.type = parameter.schema ? parameter.schema.type : parameter.type;
      preparedParameter.required = parameter.required || false;
      preparedParameter.example = parameter.example || 1234;
      return preparedParameter;
    },
    boolean: function (name, parameter) {
      let preparedParameter = {};
      preparedParameter.name = name;
      preparedParameter.description = parameter.description || preparedParameter.name;
      preparedParameter.in = parameter.in || "";
      preparedParameter.type = parameter.schema ? parameter.schema.type : parameter.type;
      preparedParameter.required = parameter.required || false;
      preparedParameter.example = parameter.example || true;
      return preparedParameter;
    },
    null: function (name, parameter) {
      let preparedParameter = {};
      preparedParameter.name = name;
      preparedParameter.description = parameter.description || preparedParameter.name;
      preparedParameter.in = parameter.in || "";
      preparedParameter.type = "null";
      preparedParameter.required = false;
      preparedParameter.example = "";
      return preparedParameter;
    },
  };
  if (parameter === null) {
    logger.debug("finished prepareParameter()", { module: thisModule });
    return {
      name: name,
      description: name,
      in: "",
      type: "string",
      required: false,
      example: null,
    };
  } else {
    logger.debug("finished prepareParameter()", { module: thisModule });
    return types[parameter.schema ? parameter.schema.type : parameter.type](name, parameter);
  }
};

const prepareConnectorForUI = async (json) => {
  logger.debug("started prepareConnectorForUI()", { module: thisModule });
  // let newRefParser = new $RefParser();

  let connectorsForUI = [];

  if (json) {
    Object.keys(json.paths).map((key) => {
      let connectorForUI = {};
      connectorForUI.name = key;
      connectorForUI.methods = [];
      Object.keys(json.paths[key]).map((method) => {
        let contentType = "application/json";
        if (json.paths[key][method].requestBody && json.paths[key][method].requestBody.content) {
          contentType = Object.keys(json.paths[key][method].requestBody.content)[0]
        }
        let thisMethod = {
          method: method.toUpperCase(),
          description: json.paths[key][method].description,
          contentType: contentType,
          security: json.paths[key][method].security || [],
        };

        // get parameters and schemas associated
        let theseParameters = [];
        if (json.paths[key][method].parameters) {
          json.paths[key][method].parameters.map((parameter) => {
            theseParameters.push(prepareParameter(parameter.name, parameter));
          });
        }
        if (json.paths[key][method].requestBody && json.paths[key][method].requestBody.content) {
          Object.keys(json.paths[key][method].requestBody.content[contentType].schema.properties).map((propertyKey) => {
            let parameter = json.paths[key][method].requestBody.content[contentType].schema.properties[propertyKey];
            theseParameters.push(prepareParameter(propertyKey, parameter));
          });
        }

        thisMethod.parameters = theseParameters;
        thisMethod.responses = [];
        if (json.paths[key][method].responses) {
          Object.keys(json.paths[key][method].responses).map((responseCode) => {
            let response = json.paths[key][method].responses[responseCode];
            let thisResponse = {};
            thisResponse.responseCode = responseCode;
            thisResponse.description = response.description || responseCode;
            thisResponse.parameters = [];
            if (response.content) {
              let contentType = Object.keys(response.content)[0];
              if (response.content[contentType].schema && response.content[contentType].schema.properties) {
                Object.keys(response.content[contentType].schema.properties).forEach((propertyName) => {
                  const property = response.content[contentType].schema.properties[propertyName];
                  thisResponse.parameters.push(prepareParameter(propertyName, property));
                });
              }
            } else if (response.schema && response.schema.properties) {
              Object.keys(response.schema.properties).forEach((propertyName) => {
                const property = response.schema.properties[propertyName];
                thisResponse.parameters.push(prepareParameter(propertyName, property));
              });
            }
            thisMethod.responses.push(thisResponse);
          });
        }
        // thisMethod.responses = json.paths[key][method].responses;
        connectorForUI.methods.push(thisMethod);
      });
      connectorsForUI.push(connectorForUI);
    });
  }
  logger.debug("finished prepareConnectorForUI()", { module: thisModule });
  return connectorsForUI;
};

const connectorsController = {
  // Create and Save a new Connector
  create: async (req, res) => {
    logger.debug("started create()", { module: thisModule });
    // Create a Connector
    // eslint-disable-next-line camelcase
    let specification_dereferenced = await $RefParser.dereference(req.body.specification);
    // eslint-disable-next-line camelcase
    let specification_processed = await prepareConnectorForUI(specification_dereferenced);

    const connector = new Connectors({
      id: req.body.id,
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      system: req.body.system,
      groups: req.body.groups,
      servers: req.body.specification.servers || [],
      securitySchemes: req.body.specification.components && req.body.specification.components.securitySchemes ? req.body.specification.components.securitySchemes : {},
      specification_raw: JSON.stringify(req.body.specification),
      specification_dereferenced: JSON.stringify(specification_dereferenced),
      specification_processed: specification_processed,
    });
    // logger.debug('connector.controller.js', 'create connector', connector);
    logger.debug("create()", "connector", { module: thisModule }, { response: connector });

    // Save Connector in the database
    connector
      .save()
      .then((data) => {
        logger.debug("finished create()", { module: thisModule }, { response: data });
        res.send(data);
      })
      .catch((err) => {
        logger.error("create()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while creating the Connector." });
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Connector.",
        });
      });
  },

  // Retrieve all Connectors from the database.
  findAll: (req, res) => {
    logger.debug("started findAll()", { module: thisModule });
    Connectors.find()
      .then((data) => {
        logger.debug("finished findAll()", { module: thisModule }, { response: `${data.length} connectors found` });
        data = data.map((connector) => {
          connector.specification_raw = {};
          connector.specification_dereferenced = {};
          return connector;
        })
        res.send(data);
      })
      .catch((err) => {
        logger.error("findAll()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while retrieving Connectors." });
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Connectors.",
        });
      });
  },

  // Find a single Connector with an id
  findOne: (req, res) => {
    logger.debug("started findOne()", { module: thisModule });
    const id = req.params.id;

    Connectors.find({ id: id })
      .then((data) => {
        if (!data) {
          logger.error("findOne()", { module: thisModule }, { error: "Did not find a Connector with id " + id });
          res.status(404).send({ message: "Did not find a Connector with id " + id });
        } else if (!Array.isArray(data)) {
          logger.error("findOne()", { module: thisModule }, { error: "Did not find a Connector with id " + id });
          res.status(404).send({ message: "Did not find a Connector with id " + id });
        } else if (Array.isArray(data) && data.length < 1) {
          logger.error("findOne()", { module: thisModule }, { error: "Did not find a Connector with id " + id });
          res.status(404).send({ message: "Did not find a Connector with id " + id });
        } else if (Array.isArray(data) && data.length > 1) {
          logger.error("findOne()", { module: thisModule }, { error: "Found more than one Connector with id " + id });
          res.status(404).send({ message: "Found more than one Connector with id " + id });
        } else {
          logger.debug("finished findOne()", { module: thisModule }, { response: data[0] });
          data[0].specification_dereferenced = {};
          data[0].specification_raw = {};
          res.send(data[0]);
        }
      })
      .catch((err) => {
        logger.error("findOne()", { module: thisModule }, { error: err.message ? err.message : "Error retrieving Connector with id=" + id });
        res.status(500).send({ message: "Error retrieving Connector with id=" + id });
      });
  },

  // Update a Connector by the id in the request
  update: (req, res) => {
    logger.debug("started update()", { module: thisModule });
    const id = req.params.id;

    Connectors.findOneAndUpdate({ id: id }, req.body, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          logger.error("update()", { module: thisModule }, { error: `Cannot update Connector with id=${id}. Maybe Connector was not found!` });
          res.status(404).send({ message: `Cannot update Connector with id=${id}. Maybe Connector was not found!` });
        } else {
          logger.debug("finished update()", { module: thisModule }, { response: data });
          res.status(200).send({ message: "Connector was updated successfully." });
        }
      })
      .catch((err) => {
        logger.error("update()", { module: thisModule }, { error: err.message ? err.message : "Error updating Connector with id=" + id });
        res.status(500).send({ message: "Error updating Connector with id=" + id });
      });
  },

  // Delete a Connector with the specified id in the request
  delete: (req, res) => {
    logger.debug("started delete()", { module: thisModule });
    const id = req.params.id;

    Connectors.findOneAndRemove({ id: id })
      .then((data) => {
        if (!data) {
          logger.error("delete()", { module: thisModule }, { error: `Cannot delete Connector with id=${id}. Maybe Connector was not found!` });
          res.status(404).send({ message: `Cannot delete Connector with id=${id}. Maybe Connector was not found!` });
        } else {
          logger.debug("finished delete()", { module: thisModule }, { response: data });
          res.send({ message: "Connector was deleted successfully!" });
        }
      })
      .catch((err) => {
        logger.error("delete()", { module: thisModule }, { error: err.message ? err.message : "Could not delete Connector with id=" + id });
        res.status(500).send({ message: "Could not delete Connector with id=" + id });
      });
  },

  // Delete all Connectors from the database.
  deleteAll: (req, res) => {
    logger.debug("started deleteAll()", { module: thisModule });
    Connectors.deleteMany({})
      .then((data) => {
        logger.debug("finished deleteAll()", { module: thisModule }, { response: data });
        res.send({ message: `${data.deletedCount} Connectors were deleted successfully!` });
      })
      .catch((err) => {
        logger.error("deleteAll()", { module: thisModule }, { error: err.message ? err.message : "Some error occurred while removing all connectors." });
        res.status(500).send({
          message: err.message || "Some error occurred while removing all connectors.",
        });
      });
  },

  // Find all published Connectors
  findAllForSystem: (req, res) => {
    logger.debug("started findAllForSystem()", { module: thisModule });
    const system = req.params.system;
    Connectors.find({ system: system })
      .exec()
      .then(async (data) => {
        if (!data) {
          res.status(404).send({ message: "Did not find Connectors for system " + system });
        } else {
          logger.debug("finished findAllForSystem()", { module: thisModule }, { response: data[0] });
          res.status(200).send(data[0]);
        }
      })
      .catch((err) => {
        logger.error("finished findAllForSystem()", { module: thisModule }, { error: err.message ? err.message : "Error retrieving Connectors for system=" + system });
        res.status(500).send({ message: "Error retrieving Connectors for system=" + system });
      });
  },
};

export default connectorsController;
