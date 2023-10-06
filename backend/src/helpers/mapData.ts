import { IConnectorRoute } from "@blockspaces/shared/models/flows/Connector";
import { Mapping } from "@blockspaces/shared/models/flows/Mapping";
import { ExecutableFlowState } from "../services/ExecutableFlowState";
import * as path from "path";
const thisModule = path.basename(__filename);
import { logger } from "@blockspaces/shared/loggers/bscLogger";

const SINGLE_VALUE = "Single Value";
const ARRAY_OF_VALUES = "Array of Values";
const ARRAY_OF_OBJECTS = "Array of Objects";

const getTypeOfField = ((path:string):string => {
  const fieldNameLength = path.length;
  const lastIndexOfArray = path.lastIndexOf("[]");
  let typeOfField = SINGLE_VALUE;
  if (lastIndexOfArray == -1) {
    typeOfField = SINGLE_VALUE;
  } else if (lastIndexOfArray == fieldNameLength - 2) {
    typeOfField = ARRAY_OF_VALUES;
  } else {
    typeOfField = ARRAY_OF_OBJECTS;
  }
  return typeOfField;
})

export const mapData = ((mappings: Array<Mapping>, flowState: ExecutableFlowState, activeMethod: IConnectorRoute): Record<string, any> => {
  logger.trace("class Connection", "entering mapData", { module: thisModule }, {context: {object:this, mappings: mappings, dataQueue: flowState.dataQueue}});
  let parameters: Record<string, any> = {};
  if (activeMethod && activeMethod.parameters) {
    activeMethod.parameters.map((parameter) => {
      const currentField = parameter.address;
      const currentMapping = mappings.filter((mapping) => {
        return mapping.destination.connectionId === currentField.connectionId &&
          mapping.destination.endpoint === currentField.endpoint &&
          mapping.destination.method === currentField.method &&
          mapping.destination.path === currentField.path;
      });
      if (currentMapping.length > 0) {
        const sourceField = currentMapping[0].source;
        const sourceFieldPath = sourceField.path;
        const sourceFieldKey = currentMapping[0].getSourceString().split(':').slice(0, 4).join(":");

        let sourceFieldPathComponents = [];
        let sourceArrayPath = "";
        let sourceArrayPathComponents: Array<string> = [];
        let sourceObjectPath = "";
        let sourceObjectPathComponents: Array<string> = [];

        const destinationField = currentMapping[0].destination;
        const destinationFieldPath = destinationField.path;

        let destinationFieldPathComponents = [];
        let destinationArrayPath = "";
        let destinationArrayPathComponents: Array<string> = [];
        let destinationObjectPath = "";
        let destinationObjectPathComponents: Array<string> = [];

        const sourceTypeOfField = getTypeOfField(<string>sourceField.path);
        const destinationTypeOfField = getTypeOfField(<string>destinationField.path);

        let destinationParameter: Record<string, any> = {};
        switch (true) {
          case sourceTypeOfField === SINGLE_VALUE && destinationTypeOfField === SINGLE_VALUE:
            // map single value to single value
            // a.b.c -> d.e.f
            // Need to get and store the value of the source dataQueue[key][a][b][c]
            //   and store it in an object called f and then add that to an object called e then add that to an object called d
            sourceFieldPathComponents = (<string>sourceField.path).split(".");
            destinationFieldPathComponents = (<string>destinationField.path).split(".");
            destinationParameter = destinationFieldPathComponents.reduceRight((data, field) => {
                logger.debug("mapData() - single value -> single value -reduceRight", { module: thisModule }, { context: { field: field, data: data } });
                let parameter:Record<string, any> = {};
                parameter[field] = data;
                return parameter;
              },
              sourceFieldPathComponents.reduce((object, field) => {
                logger.debug("mapData() - single value -> single value - reduce", { module: thisModule }, { context: { object: object || {}, field: field } });
                let tempObject:Record<string,any> = new Object();
                tempObject[field];
                return object ? object[field] : null;
              },flowState.dataQueue.getItem(sourceFieldKey))
            );

            break;
          case sourceTypeOfField === SINGLE_VALUE && destinationTypeOfField === ARRAY_OF_VALUES:
            // map a single value to an array of values
            // a.b.c -> d.e.f[]
            // Need to get and store the value of the source dataQueue[key][a][b][c]
            //    and push it into an array called f and then add that to an object called e then add that to an object called d
            sourceFieldPathComponents = (<string>sourceField.path).split(".");
            destinationFieldPathComponents = (<string>destinationField.path).split(".");
            destinationFieldPathComponents.reduceRight((data, field) => {
                logger.debug("mapData() - single value -> array of values - reduceRight", { module: thisModule }, { context: { field: field, data: data } });
                let parameter:Record<string, any> = {};
                parameter[field] = [data];
                destinationParameter = parameter;
              },
                sourceFieldPathComponents.reduce((object, field) => {
                  logger.debug("mapData() - single value -> array of values - reduce", { module: thisModule }, { context: { object: object, field: field } });
                  return object ? object[field] : null;
                }, <any>flowState.dataQueue.getItem(sourceFieldKey)),
            );

            break;
          case sourceTypeOfField === SINGLE_VALUE && destinationTypeOfField === ARRAY_OF_OBJECTS:
            // map a single value to an array of objects
            // a.b.c -> d.e[].f
            // Need to get and store the value of the source dataQueue[key][a][b][c]
            //    and store it in an object called f and then push that onto the array called e and add that to an object called d
            sourceFieldPathComponents = (<string>sourceField.path).split(".");
            destinationArrayPath = (<string>destinationField.path).substring(0, (<string>destinationField.path).lastIndexOf("[]"));
            destinationArrayPathComponents = destinationArrayPath.split(".");
            destinationObjectPath = (<string>destinationField.path).substring((<string>destinationField.path).lastIndexOf("[]") + 3);
            destinationObjectPathComponents = destinationObjectPath.split(".");
            destinationArrayPathComponents.reduceRight((data, field) => {
                logger.debug("mapData() - reduceRight", { module: thisModule }, { response: { field: field, data: data } });
                let parameter:Record<string, any> = {};
                parameter[field] = data;
                destinationParameter = parameter;
              },
                destinationObjectPathComponents.reduceRight((data, field) => {
                    logger.debug("mapData() - single value -> array of objects - reduceRight", { module: thisModule }, { context: { field: field, data: data } });
                    let parameter:Record<string, any> = {};
                    parameter[field] = [data];
                    return parameter;
                  },
                    sourceFieldPathComponents.reduce((object, field) => {
                      logger.debug("mapData() - single value -> array of objects - reduce", { module: thisModule }, { context: { object: object, field: field } });
                      return object ? object[field] : null;
                    }, flowState.dataQueue.getItem(sourceFieldKey)),
                ),
            );

            break;
          case sourceTypeOfField === ARRAY_OF_VALUES && destinationTypeOfField === ARRAY_OF_VALUES:
            // map an array of values to an array of values
            // a.b.c[] -> d.e.f[]
            sourceArrayPath = (<string>sourceField.path).substring(0, (<string>sourceField.path).lastIndexOf("[]"));
            sourceArrayPathComponents = sourceArrayPath.split(".");
            destinationArrayPath = (<string>destinationField.path).substring(0, (<string>destinationField.path).lastIndexOf("[]"));
            destinationArrayPathComponents = destinationArrayPath.split(".");
            destinationParameter = destinationArrayPathComponents.reduceRight(
              (data, field) => {
                logger.debug("mapData() - array of values -> array of values - reduceRight", { module: thisModule }, { response: { field: field, data: data } });
                let parameter:Record<string,any> = {};
                parameter[field] = data;
                return parameter;
              },
              sourceArrayPathComponents.reduce((object, field) => {
                logger.debug("mapData() - array of values -> array of values - reduce", { module: thisModule }, { response: { object: object, field: field } });
                return object ? object[field] : null;
              }, flowState.dataQueue.getItem(sourceFieldKey))
            );

            break;
          case sourceTypeOfField === ARRAY_OF_VALUES && destinationTypeOfField === ARRAY_OF_OBJECTS:
            // map an array of values to an array of objects
            // a.b.c[] -> d.e[].f
            sourceArrayPath = (<string>sourceField.path).substring(0, (<string>sourceField.path).lastIndexOf("[]"));
            sourceArrayPathComponents = sourceArrayPath.split(".");
            destinationArrayPath = (<string>destinationField.path).substring(0, (<string>destinationField.path).lastIndexOf("[]"));
            destinationArrayPathComponents = destinationArrayPath.split(".");
            destinationObjectPath = (<string>destinationField.path).substring((<string>destinationField.path).lastIndexOf("[]") + 3);
            destinationObjectPathComponents = destinationObjectPath.split(".");
            destinationArrayPathComponents.reduceRight(
              (data:any, field:string) => {
                logger.debug("mapData() - array of values -> array of objects - reduceRight", { module: thisModule }, { context: { field: field, data: data } });
                let parameter:Record<string,any> = {};
                parameter[field] = data;
                destinationParameter =  parameter;
              },
              sourceArrayPathComponents
                .reduce((object:any, field:string) => {
                  logger.debug("mapData() - array of values -> array of objects - reduce", { module: thisModule }, { context: { object: object, field: field } });
                  return object ? object[field] : null;
                }, flowState.dataQueue.getItem(sourceFieldKey))
                .map((data:any) => {
                  return destinationObjectPathComponents.reduceRight((data, field) => {
                    logger.debug("mapData() - array of values -> array of objects - reduceRight2", { module: thisModule }, { context: { field: field, data: data } });
                    let parameter:Record<string,any> = {};
                    parameter[field] = data;
                    return parameter;
                  }, data);
                })
            );
            break;
          case sourceTypeOfField === ARRAY_OF_OBJECTS && destinationTypeOfField === ARRAY_OF_OBJECTS:
            // map an array of objects to an array of objects
            // a.b[].c -> d.e[].f
            sourceArrayPath = (<string>sourceField.path).substring(0, (<string>sourceField.path).lastIndexOf("[]"));
            sourceArrayPathComponents = sourceArrayPath.split(".");
            sourceObjectPath = (<string>sourceField.path).substring((<string>sourceField.path).lastIndexOf("[]") + 3);
            sourceObjectPathComponents = sourceObjectPath.split(".");
            destinationArrayPath = (<string>destinationField.path).substring(0, (<string>destinationField.path).lastIndexOf("[]"));
            destinationArrayPathComponents = destinationArrayPath.split(".");
            destinationObjectPath = (<string>destinationField.path).substring((<string>destinationField.path).lastIndexOf("[]") + 3);
            destinationObjectPathComponents = destinationObjectPath.split(".");
            destinationArrayPathComponents.reduceRight(
              (data, field) => {
                logger.debug("mapData() - array of objects -> array of objects - reduceRight", { module: thisModule }, { context: { field: field, data: data } });
                const parameter:Record<string, any> = {};
                parameter[field] = data;
                return parameter;
              },
              sourceArrayPathComponents
                .reduce((object, field) => {
                  logger.debug("mapData() - array of objects -> array of objects - reduce", { module: thisModule }, { context: { object: object, field: field } });
                  return object ? object[field] : null;
                }, flowState.dataQueue.getItem(sourceFieldKey))
                .map((data:any) => {
                  logger.debug("mapData() - array of objects -> array of objects - map", { module: thisModule }, { context: data });
                  return sourceObjectPathComponents.reduce((object, field) => {
                    logger.debug("mapData() - array of objects -> array of objects - reduce2", { module: thisModule }, { context: { object: object, field: field } });
                    return object ? object[field] : null;
                  }, data);
                })
                .map((data:any) => {
                  return destinationObjectPathComponents.reduceRight((data, field) => {
                    logger.debug("mapData() - array of objects -> array of objects - reduceRight", { module: thisModule }, { context: { field: field, data: data } });
                    const parameter:Record<string,any> = {};
                    parameter[field] = data;
                    return parameter;
                  }, data);
                })
            );

            break;
          case sourceTypeOfField === ARRAY_OF_OBJECTS && destinationTypeOfField === ARRAY_OF_VALUES:
            // map an array of objects to an let let let let let array of values
            // a.b[].c -> d.e.f[]
            sourceArrayPath = (<string>sourceField.path).substring(0, (<string>sourceField.path).lastIndexOf("[]"));
            sourceArrayPathComponents = sourceArrayPath.split(".");
            sourceObjectPath = (<string>sourceField.path).substring((<string>sourceField.path).lastIndexOf("[]") + 3);
            sourceObjectPathComponents = sourceObjectPath.split(".");
            destinationArrayPathComponents = (<string>destinationField.path).replace("[]", "").split(".");
            const tempDestinationArray:Array<string> = [];
            sourceArrayPathComponents
              .reduce((object:any, field:string) => {
                return object ? object[field] : null;
              }, flowState.dataQueue.getItem(sourceFieldKey))
              .map((sourceArrayItem:string) => {
                tempDestinationArray.push(
                  sourceObjectPathComponents.reduce((object:any, field:string) => {
                    return object ? object[field] : null;
                  }, sourceArrayItem)
                );
              });
            destinationArrayPathComponents.reduceRight((data:any, field) => {
              const parameter:Record<string,any> = {};
              parameter[field] = [data];
              destinationParameter = parameter;
            }, tempDestinationArray);

            break;
        }
        parameters[(<string>parameter.name)] = destinationParameter[Object.keys(destinationParameter)[0]];
      }
    });
  }
  logger.debug("finished mapData()", { module: thisModule }, { response: parameters });
  return parameters;


});