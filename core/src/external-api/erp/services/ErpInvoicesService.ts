import { ErpInvoiceDto, UpdateErpInvoiceDto } from "@blockspaces/shared/dtos/erp-data";
import { ErpInvoice } from "@blockspaces/shared/models/erp-integration/ErpInvoice";
import { ErpObject, Metadata } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BadRequestException, UnprocessableEntityException } from '../../../exceptions/common'
import { UpdateQuery } from "mongoose";
import { v4 as uuid } from "uuid";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { ConnectLogger } from "../../../logging/ConnectLogger";

/**
 * CRUD ops for ERP Invoice Cache
 *
 * @class ErpInvoicesService
 * @typedef {ErpInvoicesService}
 */
@Injectable()
export class ErpInvoicesService {
  constructor(
    private readonly db: ConnectDbDataContext,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Creates new Erp Invoice document 
   *
   * @param {ErpInvoiceDto} invoiceDto
   * @param {string} tenantId
   * @returns {Promise<ErpObject>}
   */
  async create(invoiceDto: ErpInvoiceDto, tenantId: string): Promise<ErpObject> {
    const invoiceObj: ErpObject = await this.mapDtoToObject(invoiceDto, tenantId);
    const result = await this.db.erpObjects.create(invoiceObj).catch((e) => {
      if (e.name === 'MongoServerError' && e.code === 11000) {
        throw new UnprocessableEntityException("Duplicate found"); // 422
      }
      this.logger.error(`ExternalErpServices - Unexpected Create Invoice Error`, e);
      throw new BadRequestException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - createInvoice failed.", null, { 'tenantId': tenantId, data: invoiceDto });
      throw new BadRequestException("Create new invoice failed");
    }
    return result;
  }

  /**
   * Finds all Erp Invoice Docs for a given Tenant
   *
   * @param {string} tenantId
   * @returns {Promise<ErpObject[]>}
   */
  async findAll(tenantId: string, domain: string): Promise<ErpObject[]> {
    const result = await this.db.erpObjects.find({ 'metadata.tenantId': tenantId, 'metadata.domain': domain, objectType: "invoice" }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - findAllInvoices failed.", null, { tenantId: tenantId });
      throw new BadRequestException("FindAll invoices failed");
    }
    return result;
  }

  /**
   * Finds a ERP Invoice Doc for a tenant with a given ID
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @returns {Promise<ErpObject>}
   */
  async findOne(tenantId: string, externalId: string, domain: string): Promise<ErpObject> {
    const result = await this.db.erpObjects.findOne({ 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: 'invoice' }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - find Invoice failed.", null, { tenantId: tenantId, data: { externalId } });
      throw new NotFoundException("Invoice not found");
    }
    return result;
  }

  /**
   * Updates a given ERP Invoice Doc
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @param {UpdateErpInvoiceDto} invoiceDto
   * @returns {Promise<ErpObject>}
   */
  async update(tenantId: string, externalId: string, domain: string, invoiceDto: UpdateErpInvoiceDto) {
    const invoiceUpdateObj = await this.mapDtoToUpdateObject(invoiceDto);
    const query = { 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: 'invoice' };
    const result = await this.db.erpObjects.findOneAndUpdate(query, invoiceUpdateObj, { returnOriginal: false }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - updateInvoice failed.", null, { tenantId: tenantId, data: invoiceDto });
      throw new BadRequestException("Find invoices failed");
    }
    return result;
  }

  /**
   * Removes a given ERP Invoice Doc
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @returns {Promise<ErpObject>}
   */
  async remove(tenantId: string, externalId: string, domain: string) {
    const result = await this.db.erpObjects.findOneAndDelete({ 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: 'invoice' }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - deleteInvoice failed.", null, { tenantId: tenantId, data: { externalId } });
      throw new BadRequestException("Find invoices failed");
    }
    return result;
  }
  /**
   * Maps DTO to Mongoose update obj
   * See {@link https://www.mongodb.com/docs/manual/reference/operator/update/set/}
   * @param invoiceDto
   */
  private mapDtoToUpdateObject(invoiceDto: Partial<ErpInvoiceDto>): UpdateQuery<ErpObject> {
    const meta = new Metadata();
    const invoice = new ErpInvoice();
    const obj = new ErpObject();
    const res = { $set: {} };

    for (const param of Object.keys(invoiceDto)) {
      if (param in meta) res.$set[`metadata.${param}`] = invoiceDto[param];
      else if (param in invoice) res.$set[`invoiceData.${param}`] = invoiceDto[param];
      else if (param in obj) res.$set[`${param}`] = invoiceDto[param];
    }
    return res;
  };

  /**
   * Maps a DTO to an ErpObject type
   *
   * @private
   * @param {Partial<ErpInvoiceDto>} invoiceDto
   * @param {string} tenantId
   * @returns {ErpObject}
   */
  private mapDtoToObject(invoiceDto: Partial<ErpInvoiceDto>, tenantId: string, internalId: string = uuid()): ErpObject {
    return {
      internalId: internalId,
      objectType: "Invoice",
      invoiceData: {
        ...(<ErpInvoice>invoiceDto)
      },
      metadata: {
        ...(<Metadata & ErpInvoiceDto>invoiceDto),
        tenantId: tenantId
      },
      jsonBlob: invoiceDto.jsonBlob
    };
  }
}
