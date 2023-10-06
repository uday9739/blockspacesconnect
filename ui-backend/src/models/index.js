import mongoose from 'mongoose';

import System from './systems.model.js'
import Connectors from './connectors.model.js'

import clientConnectors from './clientconnectors.model.js'
import clientConnections from './clientconnections.model.js'

import schedulerDefinition from './schedulerdefinition.model.js'
import scheduledJobs from './scheduledjobs.model.js'
import Blockflow from './blockflow.model.js'
import ClientCredentials from './clientcredentials.model.js'

import Transactions from './transactions.model.js'

export default {
  mongoose,
  System: System(mongoose),
  Connectors: Connectors(mongoose),
  clientconnectors: clientConnectors(mongoose),
  clientconnections: clientConnections(mongoose),
  schedulerdefinition: schedulerDefinition(mongoose),
  scheduledjobs: scheduledJobs(mongoose),
  Blockflow: Blockflow(mongoose),
  ClientCredentials: ClientCredentials(mongoose),
  Transactions: Transactions(mongoose)
}
