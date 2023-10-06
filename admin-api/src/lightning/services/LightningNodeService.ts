import { HttpStatus, Inject, Injectable, Optional } from "@nestjs/common";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { StagingDbDataContext, ProductionDbDataContext } from "src/connect-db";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Document, HydratedDocument, Model, Types } from "mongoose";
import { ProductionDatabaseService } from "src/database/services/ProductionDatabaseService";
import { StagingDatabaseService } from "src/database/services/StagingDatabaseService";
import { User } from "@blockspaces/shared/models/users";

@Injectable()
export class LightningNodeService {
  constructor(
    private readonly stagingDb: StagingDatabaseService,
    private readonly productionDb: ProductionDatabaseService,
    // @InjectConnection('productionDatabase') private readonly productionDb: Connection,
    // @InjectConnection('stagingDatabase') private readonly stagingDb: Connection,
    // @InjectModel('LightningNodes', 'productionDatabase') private readonly productionLightningNodes: Model<LightningNodeReference>,
    // @InjectModel('LightningNodes', 'stagingDatabase') private readonly stagingLightningNodes: Model<LightningNodeReference>,
  ) { }

  async getAllNodes(): Promise<LightningNodeReference[]> {
    console.log('this.db', this.stagingDb)
    const stagingNodes = await this.stagingDb.lightningNodes.find();
    const productionNodes = await this.productionDb.lightningNodes.find();
    // const stagingUsers = <Types.DocumentArray<User>>await this.stagingDb.db.collection('userdetails').find().toArray();
    return stagingNodes.concat(productionNodes);
    // return;
  }



}
