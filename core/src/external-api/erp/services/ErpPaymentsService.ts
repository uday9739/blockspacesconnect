import { ErpPaymentDto, UpdateErpPaymentDto } from "@blockspaces/shared/dtos/erp-data";
import { ErpPayment } from "@blockspaces/shared/models/erp-integration/ErpPayment";
import { ErpObject, ErpObjectTypes, Metadata } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BadRequestException, UnprocessableEntityException } from "../../../exceptions/common";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { v4 as uuid } from "uuid";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { UpdateQuery } from "mongoose";
import { ConnectLogger } from "../../../logging/ConnectLogger";

/**
 * CRUD ops for ERP Payments Cache
 *
 * @class ErpPaymentsService
 * @typedef {ErpPaymentsService}
 */
@Injectable()
export class ErpPaymentsService {
  constructor(
    private readonly db: ConnectDbDataContext,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Creates new Erp Payment document 
   *
   * @param {ErpPaymentDto} paymentDto
   * @param {string} tenantId
   * @returns {Promise<ErpObject>}
   */
  async create(paymentDto: ErpPaymentDto, tenantId: string): Promise<ErpObject> {
    const paymentObj: ErpObject = await this.mapDtoToObject(paymentDto, tenantId);
    const result = await this.db.erpObjects.create(paymentObj).catch((e) => {
      if (e.name === 'MongoServerError' && e.code === 11000) {
        throw new UnprocessableEntityException("Duplicate found"); // 422
      }
      this.logger.error(`ExternalErpServices - Unexpected Create Payment Error`, e);
      throw new BadRequestException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - createPayment failed.", null, { tenantId: tenantId, data: paymentDto });
      throw new BadRequestException("Create new payment failed");
    }
    return result;
  }

  /**
   * Finds all Erp Payment Docs for a given Tenant
   *
   * @param {string} tenantId
   * @param {string} domain
   * @returns {Promise<ErpObject[]>}
   */
  async findAll(tenantId: string, domain: string): Promise<ErpObject[]> {
    const result = await this.db.erpObjects.find({ 'metadata:tenantId': tenantId, 'metadata.domain': domain, objectType: "payment" }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - findAllPayments failed.", null, { tenantId: tenantId });
      throw new BadRequestException("Find Payment failed");
    }
    return result;
  }

  /**
   * Finds a ERP Payment Doc for a tenant with a given ID
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @returns {Promise<ErpObject>}
   */
  async findOne(tenantId: string, externalId: string, domain: string): Promise<ErpObject> {
    const result = await this.db.erpObjects.findOne({ 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: "payment" }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - find Payment failed.", null, { tenantId: tenantId, data: { externalId } });
      throw new NotFoundException("Find Payment failed");
    }
    return result;
  }

  /**
   * Updates a given ERP Payment Doc
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @param {UpdateErpPaymentDto} paymentDto
   * @returns {Promise<ErpObject>}
   */
  async update(tenantId: string, externalId: string, domain: string, paymentDto: UpdateErpPaymentDto) {
    const paymentUpdateObj = await this.mapDtoToUpdateObject(paymentDto);
    const query = { 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: 'payment' };
    const result = await this.db.erpObjects.findOneAndUpdate(query, paymentUpdateObj, { returnOriginal: false }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - updatePayment failed.", null, { tenantId: tenantId, data: paymentDto });
      throw new BadRequestException("Payment not found");
    }
    return result;
  }

  /**
   * Removes a given ERP Payment Doc
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @returns {Promise<ErpObject>}
   */
  async remove(tenantId: string, externalId: string, domain: string) {
    const result = await this.db.erpObjects.findOneAndDelete({ 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: 'payment' }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - deletePayment failed.", null, { tenantId: tenantId, data: { externalId } });
      throw new BadRequestException("Delete payments failed");
    }
    return result;
  }
  /**
   * Maps DTO to Mongoose update obj
   * See {@link https://www.mongodb.com/docs/manual/reference/operator/update/set/}
   * @param paymentDto
   */
  private mapDtoToUpdateObject(paymentDto: Partial<ErpPaymentDto>): UpdateQuery<ErpObject> {
    const meta = new Metadata();
    const payment = new ErpPayment();
    const obj = new ErpObject();
    const res = { $set: {} };

    for (const param of Object.keys(paymentDto)) {
      if (param in meta) res.$set[`metadata.${param}`] = paymentDto[param];
      else if (param in payment) res.$set[`paymentData.${param}`] = paymentDto[param];
      else if (param in obj) res.$set[`${param}`] = paymentDto[param];
    }
    return res;
  };

  /**
   * Maps a DTO to an ErpObject type
   *
   * @private
   * @param {Partial<ErpPaymentDto>} paymentDto
   * @param {string} tenantId
   * @returns {ErpObject}
   */
  private mapDtoToObject(paymentDto: Partial<ErpPaymentDto>, tenantId: string, internalId: string = uuid()): ErpObject {
    return {
      internalId: internalId,
      objectType: "Payment",
      paymentData: {
        ...(<ErpPayment>paymentDto)
      },
      metadata: {
        ...(<Metadata & ErpPaymentDto>paymentDto),
        tenantId: tenantId
      },
      jsonBlob: paymentDto.jsonBlob
    };
  }
}
