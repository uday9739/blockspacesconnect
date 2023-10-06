import ApiResult from "@blockspaces/shared/models/ApiResult";
import { Connectors, NetworkConnectorIntegration } from "@blockspaces/shared/models/connectors";
import { Controller, Get, Param } from "@nestjs/common";
import { ConnectorsService } from "../services/ConnectorsService";


@Controller('connectors')
export class ConnectorsController {
  constructor(
    private readonly dataService: ConnectorsService,
  ) { }

  @Get()
  async getAll(): Promise<ApiResult<Connectors[]>> {
    return ApiResult.success(await this.dataService.getAllActive());
  }

  @Get('/:id')
  async getById(@Param("id") id: string): Promise<ApiResult<Connectors>> {
    return ApiResult.success(await this.dataService.getById(id));
  }


  @Get('network/:networkId')
  async getAllForNetwork(@Param("networkId") networkId: string): Promise<ApiResult<NetworkConnectorIntegration[]>> {
    return ApiResult.success(await this.dataService.getActiveForNetwork(networkId));
  }
}