import { Injectable, Inject, Optional } from '@nestjs/common';
import { Model } from 'mongoose';
import { firstDbConnection, secondDbConnection } from './mongoose.providers';
import { LightningNodeReference } from '@blockspaces/shared/models/lightning/Node';
import { InjectModel } from '@nestjs/mongoose';
import { DatabaseConnectionManager } from './DatabaseConnectionManager';
import AdminPortalUser from 'src/datacontext/dtos/AdminPortalUser';

@Injectable()
export class DatabaseService {
  constructor(
  //  @InjectModel('AdminPortalUser') readonly adminPortalUsers: Model<AdminPortalUser>
  ) {
  
  }

}
