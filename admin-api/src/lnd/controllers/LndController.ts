import { Controller, Get, Post, Query, Body, HttpStatus, Inject, NotFoundException, Param } from "@nestjs/common";
import { LndService } from "../services/LndService";
import ApiResult, { AsyncApiResult } from "@blockspaces/shared/models/ApiResult";
import {
  ChannelBalanceResponse,
  ChannelCloseSummary,
  GetInfoResponse,
  ListChannelsResponse,
  ListInvoiceResponse,
  ListPeersResponse,
  Transaction,
  AddInvoiceResponse,
  PayReq,
  ListPaymentsResponse,
  PendingChannelsResponse,
  ChannelCloseUpdate
} from "@blockspaces/shared/proto/lnrpc/lightning_pb";



@Controller("lnd")
export class LndController {
  constructor(private readonly lightning: LndService
  ) { }

  /**
   * Gets info about a user's lightning node
   * @param user Authenticated {@link User}
   * @returns Promise {@link GetInfoResponse}
   */
  @Get("/getinfo/:nodeId")
  async getNodeInfo(@Param("nodeId") nodeId: string): AsyncApiResult<GetInfoResponse.AsObject> {
    const info = await this.lightning.getInfo(nodeId);
    if (!info) {

      throw new NotFoundException();// returnErrorStatus(HttpStatus.NOT_FOUND, ApiResult.failure(`${info}`));
    }
    return ApiResult.success(info, "Node info.");
  }
}
