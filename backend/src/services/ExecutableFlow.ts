import { ConnectionType, TConnection, TConnectionFactory } from '@blockspaces/shared/models/flows/Connection';
import { Flow, FlowType, IFlow } from '@blockspaces/shared/models/flows/Flow';
import { Mapping } from '@blockspaces/shared/models/flows/Mapping';
import { TParameterFactory } from '@blockspaces/shared/models/flows/Parameter';
import dependencyGraph from "dependency-graph";
import { TExecutableConnection, TExecutableConnectionFactory } from './Connection';
import { TExecutableConnectionResponse } from './Connection/ExecutableConnectionResponse';
import { ExecutableFlowState } from './ExecutableFlowState';

export type TExecutableStep = Array<TExecutableConnection>

export class ExecutableFlow extends Flow {
  graph: any;
  steps: Array<TExecutableStep>;

  constructor(flow: IFlow, connectionFactory: TExecutableConnectionFactory, parameterFactory: TParameterFactory) {
    super(flow, <TConnectionFactory>connectionFactory, parameterFactory);
    this.steps = flow.steps.map((step) => step.map((connectionDefinition) => {
      return connectionFactory(connectionDefinition, parameterFactory);
  }));
  }

  getConnectionById(connectionId:string):TExecutableConnection {
    return this.steps.filter((step) => step.filter((connection) => connection.id === connectionId).length>0)[0].filter((connection)=> connection.id === connectionId)[0]
  }

  getConnectionsByConnectorId(connectorId:string):Array<TConnection> {
    const connections:Array<TConnection> = []
    this.steps.forEach((step) => step.forEach((connection) => connection.connectorId === connectorId ? connections.push(connection) : false ));
    return connections;
  }

  rebuildGraph(mappings:Array<Mapping>):void {
    this.graph = new dependencyGraph.DepGraph();
    mappings.map((mapping: Mapping) => {
      this.graph.addNode(mapping.source.connectionId,<TExecutableConnection>this.getConnectionById(mapping.source.connectionId));
      this.graph.addNode(mapping.destination.connectionId, <TExecutableConnection>this.getConnectionById(mapping.destination.connectionId));
      this.graph.addDependency(mapping.destination.connectionId, mapping.source.connectionId)
    });
  };

  getExecutionOrder (mappings:Array<Mapping>):Array<Array<string>> {
    this.rebuildGraph(mappings);
    let orderedMappings:Array<Array<string>> = [[]];
    let order:Array<string> = this.graph.overallOrder();
  
    const buildTree = ((items:Array<string>) => {
      orderedMappings.push(items);
      let filteredItems:Array<string> = items.filter((item) => order.includes(item))
      order = order.filter((orderItem) => !filteredItems.includes(orderItem))
      let nextItems:Array<string> = [];
      let allDependants:Array<string> = [];
      filteredItems.map((filteredItem) => {
        this.graph.directDependantsOf(filteredItem).map((dependantItem:string) => {
          nextItems.push(dependantItem);
        })
      })
      nextItems = nextItems.sort().filter((item, index, self) => self.indexOf(item) === index);
      nextItems.map((nextItem) => {
        this.graph.dependantsOf(nextItem).map((item:string) => {
          allDependants.push(item);
        });
      })
      allDependants.sort().filter((item, index, self) => self.indexOf(item) === index);
      nextItems = nextItems.filter((item) => !allDependants.includes(item))
      if (nextItems.length > 0) {
        buildTree(nextItems);
      }
    })
  
    if (order.length>0) {
      buildTree([order[0]])
    }
    
    // The first orderedItem is always a null array, which is not needed
    return orderedMappings.slice(1);
  }

  getExpectedResponsesToCurrentNode (mappings: Array<Mapping>, connectionId:string, expectedResponses:Record<string,string>):Record<string,string> {
    // let sourceNodesAndResponseCodes = this.getSourceNodesAndResponseCodes(connectionId)
    // sourceNodesAndResponseCodes.map((nodeAndResponseCode) => expectedResponses[nodeAndResponseCode.connection.id] = nodeAndResponseCode.responseCode);
    const previousConnectionIds:Array<string> = this.graph.directDependenciesOf(connectionId);
    previousConnectionIds.map((previousConnectionId) => {
      const previousNode = mappings.find( mapping => mapping.source.connectionId === previousConnectionId )
      expectedResponses = this.getExpectedResponsesToCurrentNode(mappings, (<Mapping>previousNode).source.connectionId, expectedResponses);
    })
    return expectedResponses;
  }

  public async execute(initialData?:any):Promise<Array<TExecutableConnectionResponse>> {
    let flowState = new ExecutableFlowState(this);
    initialData ? flowState.dataQueue.addItem('initialData', initialData): null;
    let responseToReturn:Array<TExecutableConnectionResponse> = [];
   
    const doConnection = (async(connectionId:string):Promise<void> =>  {
      return new Promise(async (resolve,reject) => {
        let connection = this.getConnectionById(connectionId);
        let expectedResponses:Record<string,string> = {};
        expectedResponses = this.getExpectedResponsesToCurrentNode(this.mappings, connection.id, expectedResponses);
        let executeNode: boolean = true;
        Object.keys(expectedResponses).some((sourceConnectionId) => {
          if (expectedResponses[sourceConnectionId] !== flowState.actualResponses[sourceConnectionId]) {
            executeNode = false;
            flowState.connectionSkipped(connection,`Expected response Code: ${JSON.stringify(expectedResponses)} but received ${JSON.stringify(flowState.actualResponses)}`);
          }
        });
        if (executeNode) {
          flowState.waiting();
          await connection.execute(this.mappings, flowState)
            .then((response:TExecutableConnectionResponse) => {
              if (connection.type === ConnectionType.RESPONSE || connection.activeMethod?.responses.some(connectionResponse => connectionResponse.responseCode===response.responseCode)) {
                flowState.connectionCompleted(connection, response);
                flowState.dataQueue.addItem(`${connection.id}:${connection.activeMethod?.method}:${connection.activeMethod?.name}:${response.responseCode}`, response.data);
              } else {
                flowState.connectionErrored(connection,response);
                reject(<TExecutableConnectionResponse>{
                  responseCode:"500",
                  message:`Received response code that was not expected`,
                  data: {
                    connectionId: connection.id,
                    response: response,
                    data: response.data
                  }
                })
              }
            })
            .catch((error:TExecutableConnectionResponse) => {
              flowState.connectionErrored(connection,error);
              reject(error)
            });
          }
        resolve();
      })
    })

    const doStep = (async (steps:Array<Array<string>>,stepIndex:number) => {
      const stepConnections = steps[stepIndex].map((connectionId:string):Promise<void> => 
        doConnection(connectionId)
        .catch((error:any) => {
          throw <TExecutableConnectionResponse> {
            responseCode:"500",
            message:`Error processing connection ${connectionId}`,
            data:error
          }
        })
      );

      await Promise.all(stepConnections)
      .then(async () => {
        if (stepIndex+1 < steps.length) {
          await doStep(steps, stepIndex+1)
          .catch((error) => {
            throw <TExecutableConnectionResponse> {
            responseCode:"500",
            message:`Error processing step ${stepIndex}`,
            data:error
          }
          })
        }
      })
      .catch((error) => {
        throw <TExecutableConnectionResponse> {
            responseCode:"500",
            message:`Error processing step ${stepIndex}`,
            data:error
          }
      })
    });

    let responseData = {};
    flowState.started();

    await doStep(this.getExecutionOrder(this.mappings),0)
      .then(()=> {
        if (this.type === FlowType.ROUNDTRIP) {
          responseData = flowState.dataQueue.getItem('responseData');
          if (typeof responseData === 'undefined') {
            flowState.errored();
            throw <TExecutableConnectionResponse>{
              responseCode:"500",
              message:'No response data found',
              data:{}
            };
          } else {
            responseToReturn = [
              {
                responseCode:'200',
                message:'Successful',
                data: responseData
              }
            ]
          }
        } else {
          responseToReturn = flowState.executionResponse;
        }
      })
      .catch((error) => {
        flowState.errored();
        throw <TExecutableConnectionResponse> {
            responseCode:"500",
            message:`Error processing steps`,
            data:error
          }
      });
    flowState.completed();
    return responseToReturn;
  }
}