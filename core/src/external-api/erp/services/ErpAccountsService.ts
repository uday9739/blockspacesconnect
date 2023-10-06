import { ErpAccountDto, UpdateErpAccountDto } from "@blockspaces/shared/dtos/erp-data";
import { ErpAccount } from "@blockspaces/shared/models/erp-integration/ErpAccount";
import { ErpObject, Metadata } from "@blockspaces/shared/models/erp-integration/ErpObjects";
import { Inject, Injectable, } from "@nestjs/common";
import { BadRequestException, NotFoundException, UnprocessableEntityException } from "../../../exceptions/common";
import { UpdateQuery } from "mongoose";
import { v4 as uuid } from "uuid";
import { ConnectDbDataContext } from "../../../connect-db/services/ConnectDbDataContext";
import { DEFAULT_LOGGER_TOKEN } from "../../../logging/constants";
import { ConnectLogger } from "../../../logging/ConnectLogger";

/**
 * CRUD ops for ERP Accounts Cache
 *
 * @class ErpAccountsService
 * @typedef {ErpAccountsService}
 */
@Injectable()
export class ErpAccountsService {
  constructor(
    private readonly db: ConnectDbDataContext,
    @Inject(DEFAULT_LOGGER_TOKEN) private readonly logger: ConnectLogger
  ) {
    logger.setModule(this.constructor.name);
  }

  /**
   * Creates new Erp Account document
   *
   * @param {ErpAccountDto} accountDto
   * @param {string} tenantId
   * @returns {Promise<ErpObject>}
   */
  async create(accountDto: ErpAccountDto, tenantId: string): Promise<ErpObject> {
    const accountObj: ErpObject = await this.mapDtoToObject(accountDto, tenantId);
    const result = await this.db.erpObjects.create(accountObj).catch((e) => {
      if (e.name === 'MongoServerError' && e.code === 11000) {
        throw new UnprocessableEntityException("Duplicate found"); // 422
      }
      this.logger.error(`ExternalErpServices - Unexpected Create Account Error`, e);
      throw new BadRequestException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - createAccount failed.", null, { tenantId: tenantId, data: accountDto });
      throw new BadRequestException("Create new account failed");
    }
    return result;
  }

  /**
   * Finds all Erp Account Docs for a given Tenant
   *
   * @param {string} tenantId - The Tenant ID
   * @param {string} domain - The Domain
   * @returns {Promise<ErpObject[]>}
   */
  async findAll(tenantId: string, domain: string): Promise<ErpObject[]> {
    const result = await this.db.erpObjects.find({ 'metadata.tenantId': tenantId, 'metadata.domain': domain, objectType: "account" }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - findAllAccounts failed.", null, { tenantId: tenantId });
      throw new BadRequestException("Accounts not found");
    }
    return result;
  }

  /**
   * Finds a ERP Account Doc for a tenant with a given ID
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @returns {Promise<ErpObject>}
   */
  async findOne(tenantId: string, externalId: string, domain: string): Promise<ErpObject> {
    const result = await this.db.erpObjects.findOne({ 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: 'account' }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - find Account failed.", null, { tenantId: tenantId, data: { externalId } });
      throw new NotFoundException("Account not found");
    }
    return result;
  }

  /**
   * Updates a given ERP Account Doc.
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @param {UpdateErpAccountDto} accountDto
   * @returns {Promise<ErpObject>} Updated Document
   */
  async update(tenantId: string, externalId: string, domain: string, accountDto: UpdateErpAccountDto): Promise<ErpObject> {
    const accountUpdateObj = this.mapDtoToUpdateObject(accountDto);
    const query = { 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: 'account' };
    const result = await this.db.erpObjects.findOneAndUpdate(query, accountUpdateObj, { returnOriginal: false }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - updateAccount failed.", null, { tenantId: tenantId, data: accountDto });
      throw new BadRequestException("Account not found");
    }
    return result;
  }

  /**
   * Removes a given ERP Account Doc
   *
   * @param {string} tenantId
   * @param {string} externalId
   * @param {string} domain
   * @returns {Promise<ErpObject>}
   */
  async remove(tenantId: string, externalId: string, domain: string) {
    const result = await this.db.erpObjects.findOneAndDelete({ 'metadata.domain': domain, 'metadata.tenantId': tenantId, 'metadata.externalId': externalId, objectType: 'account' }).catch((_) => {
      throw new UnprocessableEntityException("Request Failed");
    });
    if (!result) {
      this.logger.warn("External Api - deleteAccount failed.", null, { tenantId: tenantId, data: { externalId } });
      throw new BadRequestException("Account not found");
    }
    return result;
  }

  /**
   * Maps DTO to Mongoose update obj
   * See {@link https://www.mongodb.com/docs/manual/reference/operator/update/set/}
   * @param accountDto
   */
  private mapDtoToUpdateObject(accountDto: Partial<ErpAccountDto>): UpdateQuery<ErpObject> {
    const meta = new Metadata();
    const account = new ErpAccount();
    const obj = new ErpObject();
    const res = { $set: {} };

    for (const param of Object.keys(accountDto)) {
      if (param in meta) res.$set[`metadata.${param}`] = accountDto[param];
      else if (param in account) res.$set[`accountData.${param}`] = accountDto[param];
      else if (param in obj) res.$set[`${param}`] = accountDto[param];
    }
    return res;
  };


  /**
   * Maps a DTO to an ErpObject type
   *
   * @private
   * @param {Partial<ErpAccountDto>} accountDto
   * @param {string} tenantId
   * @returns {ErpObject}
   */
  private mapDtoToObject(accountDto: Partial<ErpAccountDto>, tenantId: string, internalId: string = uuid()): ErpObject {
    return {
      internalId: internalId,
      objectType: "Account",
      accountData: {
        ...(accountDto as ErpAccount)
      },
      metadata: {
        ...(accountDto as Metadata & ErpAccountDto),
        tenantId: tenantId,
      },
      jsonBlob: accountDto.jsonBlob
    };
  }
}