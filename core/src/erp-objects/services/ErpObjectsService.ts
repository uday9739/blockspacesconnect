import { Injectable, NotFoundException } from "@nestjs/common";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { ErpObject } from "@blockspaces/shared/models/erp-integration/ErpObjects";

@Injectable()
export class ErpObjectsService {
  constructor(private readonly db: ConnectDbDataContext) {}

  async lookupErpObject(tenantId: string, externalId: string, domain: string): Promise<ErpObject> {
    const result = await this.db.erpObjects.findOne({"metadata.tenantId": tenantId, "metadata.externalId": externalId, "metadata.domain": domain})
    if (!result) {
      throw new NotFoundException("Can't find invoice.")
    }
    return result
  }
}