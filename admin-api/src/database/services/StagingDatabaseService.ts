import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { firstDbConnection, secondDbConnection } from './mongoose.providers';
import { LightningNodeReference } from '@blockspaces/shared/models/lightning/Node';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseConnectionManager } from './DatabaseConnectionManager';
import { User } from '@blockspaces/shared/models/users';
const database = 'stagingDatabase';

@Injectable()
export class StagingDatabaseService {
  constructor(
    @InjectModel('LightningNodes', database) readonly lightningNodes: Model<LightningNodeReference>,
    @InjectModel('UserDetails', database) readonly users: Model<User>,
  ) { }

}
