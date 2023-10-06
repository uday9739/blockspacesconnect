import { ErpSalesReceiptDto, UpdateErpPaymentDto } from "@blockspaces/shared/dtos/erp-data";
import { ErpSalesReceipt } from "@blockspaces/shared/models/erp-integration/ErpSalesReceipt";
import { ErpObject, Metadata } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BadRequestException, UnprocessableEntityException } from "../../../exceptions/common";
import { v4 as uuid } from "uuid";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { UpdateQuery } from "mongoose";
import { ConnectLogger } from "../../../logging/ConnectLogger";
import { ErpMetadata } from "@blockspaces/shared/models/lightning/Integration";

/**
 * CRUD ops for ERP SalesReceipts Cache
 *
 * @class ErpSalesReceiptsService
 * @typedef {ErpSalesReceiptsService}
 */
@Injectable()
export class ErpSalesReceiptsService {
  constructor(
    private readonly db: ConnectDbDataContext,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Creates new Erp SalesReceipt document
   *
   * @param {ErpSalesReceiptDto} salesReceiptDto
   * @param {string} tenantId
   * @returns {Promise<ErpObject>}
   */
  async create(salesReceiptDto: ErpSalesReceiptDto, tenantId: string): Promise<ErpObject> {
    const salesReceiptObj: ErpObject = await this.mapDtoToObject(salesReceiptDto, tenantId);
    const result = await this.db.erpObjects.create(salesReceiptObj).catch((e) => {
      if (e.name === 'MongoServerError' && e.code === 11000) {
        throw new UnprocessableEntityException("Duplicate found"); // 422
      }
      this.logger.error(`ExternalErpServices - Unexpected Create SalesReceipt Error ${e}`);
      throw new BadRequestException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - createSalesReceipt failed.", null, { tenantId: tenantId, data: salesReceiptDto });
      throw new BadRequestException("Create new salesReceipt failed");
    }
    const erpMetadata: ErpMetadata = { domain: salesReceiptDto.domain, dataType: "revenueCategory", value: salesReceiptDto.externalId };
    const payReq = JSON.parse(salesReceiptDto.jsonBlob).ln_payment_request;
    await this.db.lightningInvoices.findOneAndUpdate({"quote.paymentRequest": payReq}, {erpMetadata: erpMetadata}).catch((e) => {
      this.logger.error(`ErpSalesReceiptService - could not update lightning invoice with erpMetadata. ${tenantId}`);
    })

    return result;
  }

  /**
   * Finds all Erp SalesReceipt Docs for a given Tenant
   *
   * @param {string} tenantId
   * @param {string} domain
   * @returns {Promise<ErpObject[]>}
   */
  async findAll(tenantId: string, domain: string): Promise<ErpObject[]> {
    const result = await this.db.erpObjects.find({ 'metadata.tenantId': tenantId, 'metadata.domain': domain, objectType: "salesreceipt" }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      throw new BadRequestException("Find salesReceipts failed");
    }
    return result;
  }

  /**
   * Finds a ERP SalesReceipt Doc for a tenant with a given ID
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @returns {Promise<ErpObject>}
   */
  async findOne(tenantId: string, externalId: string, domain: string): Promise<ErpObject> {
    const result = await this.db.erpObjects.findOne({ 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, 'metadata.domain': domain, objectType: "salesreceipt" }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      throw new NotFoundException("Find salesReceipts failed");
    }
    return result;
  }

  /**
   * Updates a given ERP SalesReceipt Doc
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @param {UpdateErpPaymentDto} salesReceiptDto
   * @returns {Promise<ErpObject>}
   */
  async update(tenantId: string, externalId: string, domain: string, salesReceiptDto: UpdateErpPaymentDto) {
    const salesReceiptUpdateObj = await this.mapDtoToUpdateObject(salesReceiptDto);
    const query = { 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: "salesreceipt" };
    const result = await this.db.erpObjects.findOneAndUpdate(query, salesReceiptUpdateObj, { returnOriginal: false }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      throw new BadRequestException("Find salesReceipts failed");
    }
    return result;
  }

  /**
   * Removes a given ERP SalesReceipt Doc
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @returns {Promise<ErpObject>}
   */
  async remove(tenantId: string, externalId: string, domain: string) {
    const result = await this.db.erpObjects.findOneAndDelete({ 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: "salesreceipt" }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - deleteSalesReceipt failed.", null, { tenantId: tenantId, data: { externalId } });
      throw new BadRequestException("Find salesReceipts failed");
    }
    return result;
  }

  /**
   * Maps DTO to Mongoose update obj
   * See {@link https://www.mongodb.com/docs/manual/reference/operator/update/set/}
   * @param salesReceiptDto
   */
  private mapDtoToUpdateObject(salesReceiptDto: Partial<ErpSalesReceiptDto>): UpdateQuery<ErpObject> {
    const meta = new Metadata();
    const salesReceipt = new ErpSalesReceipt();
    const obj = new ErpObject();
    const res = { $set: {} };

    for (const param of Object.keys(salesReceiptDto)) {
      if (param in meta) res.$set[`metadata.${param}`] = salesReceiptDto[param];
      else if (param in salesReceipt) res.$set[`salesReceiptData.${param}`] = salesReceiptDto[param];
      else if (param in obj) res.$set[`${param}`] = salesReceiptDto[param];
    }
    return res;
  };

  /**
   * Maps a DTO to an ErpObject type
   *
   * @private
   * @param {Partial<ErpSalesReceiptDto>} salesReceiptDto
   * @param {string} tenantId
   * @returns {ErpObject}
   */
  private mapDtoToObject(salesReceiptDto: Partial<ErpSalesReceiptDto>, tenantId: string, internalId: string = uuid()): ErpObject {
    return {
      internalId: internalId,
      objectType: "SalesReceipt",
      salesReceiptData: {
        ...(<ErpSalesReceipt>salesReceiptDto)
      },
      metadata: {
        ...(<Metadata & ErpSalesReceiptDto>salesReceiptDto),
        tenantId: tenantId
      },
      jsonBlob: salesReceiptDto.jsonBlob
    };
  }
}
