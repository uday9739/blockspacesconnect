import { ErpPurchaseDto } from "@blockspaces/shared/dtos/erp-data";
import { ErpObject, Metadata } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { Inject, Injectable } from "@nestjs/common";
import { BadRequestException, UnprocessableEntityException } from "../../../exceptions/common";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { v4 as uuid } from "uuid";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { ConnectLogger } from "../../../logging/ConnectLogger"

/**
 * CRUD ops for ERP Purchases Cache
 *
 * @class ErpPurchasesService
 * @typedef {ErpPurchasesService}
 */
@Injectable()
export class ErpPurchasesService {
  constructor(
    private readonly db: ConnectDbDataContext,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Creates new Erp Purchase document 
   *
   * @param {ErpPurchaseDto} purchasetDto
   * @param {string} tenantId
   * @returns {Promise<ErpObject>}
   */
  async create(purchaseDto: ErpPurchaseDto, tenantId: string): Promise<ErpObject> {
    const purchaseObj: ErpObject = await this.mapDtoToObject(purchaseDto, tenantId);
    const result = await this.db.erpObjects.create(purchaseObj).catch((e) => {
      if (e.name === 'MongoServerError' && e.code === 11000) {
        throw new UnprocessableEntityException("Duplicate found"); // 422
      }
      this.logger.error(`ExternalErpServices - Unexpected Create Purchase Error`, e);
      throw new BadRequestException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - createPurchase failed.", null, { tenantId: tenantId, data: purchaseDto });
      throw new BadRequestException("Create new purchase failed");
    }
    return result;
  }

  /**
   * Maps a DTO to an ErpObject type
   *
   * @private
   * @param {Partial<ErpPurchaseDto>} purchaseDto 
   * @param {string} tenantId
   * @returns {ErpObject}
   */
  private mapDtoToObject(purchaseDto: Partial<ErpPurchaseDto>, tenantId: string, internalId: string = uuid()): ErpObject {
    return {
      internalId: internalId,
      objectType: "Purchase",
      paymentData: {
        ...(<ErpPurchaseDto>purchaseDto)
      },
      metadata: {
        ...(<Metadata & ErpPurchaseDto>purchaseDto),
        tenantId: tenantId
      },
      jsonBlob: purchaseDto.jsonBlob
    };
  }
}