import ApiResult from "@blockspaces/shared/models/ApiResult";
import { CreateLightningNodeDto, LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { User } from "../../../../users";
import { IUser } from "@blockspaces/shared/models/users";
import { ValidRoute } from "../../../../validation";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import logger from "@blockspaces/shared/loggers/bscLogger";
import { returnErrorStatus } from "../../../../exceptions/utils";
import { AllowAnonymous } from "../../../../auth";
import { AdminOnly } from "../../../../auth/decorators/AdminOnly.decorator";

@ValidRoute()
@Controller("/networks/lightning/node")
export class LightningNodeController {
  constructor(private readonly db: ConnectDbDataContext) {}

  /**
   * CREATES a new node association for lightning customer.
   * @param body {@link CreateLightningNodeDto}
   * @returns promise of {@link LightningNodeReference}
   */
  @Post()
  async create(@Body() body: CreateLightningNodeDto): Promise<ApiResult<LightningNodeReference>> {
    const createNode = {
      nodeId: uuidv4(),
      ...body
    };
    try {
      const res = await this.db.lightningNodes.create(createNode);
      return ApiResult.success(res);
    } catch (e) {
      logger.error(`Could not create the Node: ${body.nodeId}`,{data: createNode},{error: e},{stacktrace: e.stack});
      return ApiResult.failure(`Could not create the Node: ${body.nodeId}`);
    }
  }

  /**
   * Get Node data by Tenant Id.
   *
   * @param user {@link IUser}
   * @returns promise of {@link LightningNodeReference}
   */
  @Get()
  @AllowAnonymous()
  async findByTenant(@Query("tenantId") tenantId:string): Promise<ApiResult<LightningNodeReference>> {
    const node = await this.db.lightningNodes.findOne({ tenantId: tenantId, decomissioned: {$exists: false} });
    if(!node){
      // return ApiResult.failure(`Node for Tenant: ${tenantId} could not be found.`);
      returnErrorStatus(HttpStatus.NOT_FOUND, `Node for Tenant: ${tenantId} could not be found.`, {log:false});
    }
    return ApiResult.success(node);
  }

  /**
   * Get a list of all aviable Nodes.
   *
   * @returns promise of {@link LightningNodeReference} Array.
   */
  @Get('all')
  async findAll(): Promise<ApiResult<LightningNodeReference[]>> {
    const nodes = await this.db.lightningNodes.findAll();
    if(!nodes){
      // return ApiResult.failure(`Nodes could not be found.`);
      returnErrorStatus(HttpStatus.NOT_FOUND, `Nodes could not be found.`, {log:false});
    }
    return ApiResult.success(nodes);
  }

  /**
   * Update an existing Node.
   *
   * @param nodeId :: Node Id input as a string
   * @param body {@link LightningNodeReference}
   * @returns promise of updated {@link LightningNodeReference} 
   */
  @Put(':nodeId')
  async update(@Param("nodeId") nodeId: string, @Body() body: Partial<LightningNodeReference>): Promise<ApiResult<LightningNodeReference>> {
    const node = await this.db.lightningNodes.findOneAndUpdate({ nodeId: nodeId, decomissioned: {$exists: false} }, body);
    if(!node){
      // return ApiResult.failure(`Node ${nodeId} could not be found.`);
      returnErrorStatus(HttpStatus.NOT_FOUND, `Node ${nodeId} could not be found.`, {log:false});
    }
    return ApiResult.success(node);
  }

  /**
   * Delete a Node
   * @param id :: Node Id as a string
   * @returns promis of {@link LightningNodeReference}
   */
  @Delete()
  async delete(@Query("nodeId") id: string): Promise<ApiResult<LightningNodeReference>> {
    const deleteNode = await this.db.lightningNodes.findOneAndDelete({ nodeId: id, decomissioned: {$exists: false} });
    if(!deleteNode){
      // return ApiResult.failure(`Node ${id} was not deleted, node could not be found.`);
      returnErrorStatus(HttpStatus.NOT_FOUND, `Node ${id} was not deleted, node could not be found.`, {log:false});
    }
    return ApiResult.success(deleteNode);
  }

  @AdminOnly()
  @Post("/decomission/:nodeId")
  async decomission(@Param("nodeId") nodeId: string) {
    const decomission = await this.db.lightningNodes.findOneAndUpdate({nodeId: nodeId}, {decomissioned: true})
    if (!decomission) {
      returnErrorStatus(HttpStatus.BAD_REQUEST, `Node ${nodeId} was not decomissioned.`)
    }
    return ApiResult.success(decomission)
  }
}
