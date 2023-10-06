import { WalletBalanceResponse, AddInvoiceResponse, ChannelBalanceResponse, ChannelCloseSummary, ChannelOpenUpdate, ChannelCloseUpdate, GetInfoResponse, Invoice, ListChannelsResponse, ListInvoiceResponse, ListPaymentsResponse, ListPeersResponse, PayReq, PendingChannelsResponse, Transaction } from "@blockspaces/shared/proto/lnrpc/lightning_pb";
import { forwardRef, HttpStatus, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BitcoinTransactionDto, IncomingPaymentDto, OutgoingPaymentDto, ChannelsDto, CancelInvoiceDto, GenerateBolt11Dto, TrackInvoiceDto, OpenChannelDto, CloseChannelDto, AddPeerDto, NewAddressDto } from "@blockspaces/shared/dtos/lightning";
import { LightningHttpService } from "./LightningHttpService";
import { LightningNodeReference, LndVersion } from "@blockspaces/shared/models/lightning/Node";

import { StagingDatabaseService } from "src/database/services/StagingDatabaseService";
import { ProductionDatabaseService } from "src/database/services/ProductionDatabaseService";
import { ConnectDbDataContext } from "src/connect-db/services/ConnectDbDataContext";
import { EnvironmentVariables, ENV_TOKEN } from "src/env";
import { DEFAULT_LOGGER_TOKEN } from "src/logging/constants";
import { ConnectLogger } from "src/logging/ConnectLogger";


@Injectable()
export class LndService {
  /**
   * Constructor for {@link LndService}
   * @param db {@link ConnectDbDataContext}
   * @param env {@link EnvironmentVariables}
   * @param http {@link LightningHttpService}
   */
  constructor(
    @Inject(forwardRef(() => LightningHttpService)) private readonly http: LightningHttpService,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger,
    private readonly stagingDb: StagingDatabaseService,
    private readonly productionDb: ProductionDatabaseService,
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Returns the node lightning information.
   *
   * @param tenantId The tenantId of the user making the call.
   * @throws NotFoundException when there is no node data for the user's tenantId.
   * @returns ApiResult containing the GetInfo {@link GetInfoResponse}
   */
  getInfo = async (nodeId: string): Promise<GetInfoResponse.AsObject> => {
    try {
      const nodeData = await this.getNodeData(nodeId);
      let info;
      if (nodeData?.bscMacaroon) {
        info = await this.http.get(nodeData.apiEndpoint, "/v1/getinfo", nodeData.bscMacaroon, nodeData.cert, undefined);
      } else {
        info = await this.http.get(nodeData.apiEndpoint, "/v1/getinfo", undefined, nodeData.cert);
      }

      if (info.status === HttpStatus.SERVICE_UNAVAILABLE) {
        this.logger.error(`Customer data is unreachable. nodeId: ${nodeId}. Error: ${info.data}`);
        return null
      }

      return info.data;
    } catch (e) {
      // Catches if node is not unlocked
      if (e?.response?.data?.code === 2) return e.response.data;

      this.logger.error("Lnd getInfo failed.", e, { data: { nodeId } });
      return null;
    }
  };


  private getNodeData = async (nodeId: string): Promise<LightningNodeReference> => {
    const stgNodeData = await this.stagingDb.lightningNodes.findOne({ nodeId: nodeId, decomissioned: { $exists: false } });
    const prodNodeData = await this.productionDb.lightningNodes.findOne({ tenantId: nodeId, decomissioned: { $exists: false } });

    return stgNodeData || prodNodeData;
  };
}
