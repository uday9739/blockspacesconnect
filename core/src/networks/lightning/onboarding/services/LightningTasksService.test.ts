import { IUser } from "@blockspaces/shared/models/users";
import { BadRequestException } from "@nestjs/common";
import { createMock } from "ts-auto-mock";
import { ConnectDbDataContext } from "../../../../connect-db/services/ConnectDbDataContext";
import { LightningInvoiceService } from "../../invoices/services/LightningInvoiceService";
import { LightningTasksService } from "./LightningTasksService";
import { SnsTransportClient } from "../../../../sns-transport/sns-transport-client";
import { ConnectLogger } from "../../../../logging/ConnectLogger";
import { of, throwError } from "rxjs";
import { EnvironmentVariables } from "../../../../env";
import { LightningNodeReference } from "@blockspaces/shared/models/lightning/Node";
import { LndService } from "../../lnd/services/LndService";
import { EmailService } from "../../../../notifications/services";
import { Notification } from "@blockspaces/shared/models/platform";

describe(LightningTasksService, () => {

  let mocks: {
    db: ConnectDbDataContext;
    lightningInvoiceService: LightningInvoiceService;
    lndService: LndService;
    emailService: EmailService
    logger: ConnectLogger;
    snsClient: SnsTransportClient;
    env: EnvironmentVariables;
  };
  let service: LightningTasksService;

  beforeEach(() => {
    mocks = {
      db: createMock<ConnectDbDataContext>(),
      lightningInvoiceService: createMock<LightningInvoiceService>(),
      lndService: createMock<LndService>(),
      emailService: createMock<EmailService>(),
      logger: createMock<ConnectLogger>(),
      snsClient: createMock<SnsTransportClient>(),
      env: createMock<EnvironmentVariables>(),
    };
    service = new LightningTasksService(
      mocks.db, 
      mocks.lightningInvoiceService,
      mocks.lndService,
      mocks.emailService,
      mocks.logger,
      mocks.snsClient,
      mocks.env,
    );
  });

  describe('refreshAllObjectsForAllUsers', () => {
    it('should reject if it errors getting all users with Lightning and the Cyclr Feature Flag', async () => {
      mocks.db.users.find = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(service.refreshAllObjectsForAllUsers()).rejects.toThrowError(BadRequestException);
    });

    it('should resolve if it finds no users with Lightning and the Cyclr Feature Flag', async () => {
      mocks.db.users.find = jest.fn().mockResolvedValueOnce([]);
      await expect(service.refreshAllObjectsForAllUsers()).resolves.toBeUndefined();
      expect(mocks.lightningInvoiceService.refreshAllObjects).toBeCalledTimes(0);
    });

    it('should reject if it finds a user with Lightning and the Cyclr Feature Flag but errors calling refreshAllObjects', async () => {
      const user = createMock<IUser>();
      mocks.db.users.find = jest.fn().mockResolvedValueOnce([user]);
      mocks.lightningInvoiceService.refreshAllObjects = jest.fn().mockRejectedValueOnce(new BadRequestException());
      await expect(service.refreshAllObjectsForAllUsers()).rejects.toThrowError(BadRequestException);
      expect(mocks.lightningInvoiceService.refreshAllObjects).toBeCalledTimes(1);
    });

    it('should resolve if it finds a user with Lightning and the Cyclr Feature Flag and is successful calling refreshAllObjects', async () => {
      const user = createMock<IUser>();
      mocks.db.users.find = jest.fn().mockResolvedValueOnce([user]);
      mocks.lightningInvoiceService.refreshAllObjects = jest.fn().mockResolvedValueOnce(() => Promise.resolve());
      await expect(service.refreshAllObjectsForAllUsers()).resolves.toBeUndefined();
      expect(mocks.lightningInvoiceService.refreshAllObjects).toBeCalledTimes(1);
    });
  });
  describe('provisionLightningNodes', () => {
    beforeEach(() => {
      mocks.env.isProduction = true;
      mocks.db.lightningNodes.find = jest.fn().mockResolvedValue([]);
    });
    it('should call snsClient.send with the correct arguments, 3 times', async () => {
      mocks.env.lightning.maxNodePoolSize = '3';
      jest.spyOn(service['snsClient'], 'send').mockReturnValue(of({ $metadata: { httpStatusCode: 200 } }));
      const response = await service.provisionLightningNodes();
      expect(service['snsClient'].send).toHaveBeenCalledTimes(3);
      expect(service['snsClient'].send).toHaveBeenCalledWith('send', expect.any(String));
      expect(response.success).toBe(true);
    });
    it('should not call snsClient.send when pool is full', async () => {
      mocks.env.lightning.maxNodePoolSize = '1';
      mocks.db.lightningNodes.find = jest.fn().mockResolvedValue([createMock<LightningNodeReference>()]);
      jest.spyOn(service['snsClient'], 'send').mockReturnValue(of({ $metadata: { httpStatusCode: 200 } }));
      const response = await service.provisionLightningNodes();
      expect(service['snsClient'].send).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(true);
    });
    it('should return success: false when snsClient.send fails', async () => {
      mocks.env.lightning.maxNodePoolSize = '1';
      jest.spyOn(service['snsClient'], 'send').mockReturnValue(throwError(() => new Error('An error occurred')));
      const response = await service.provisionLightningNodes();
      expect(response.success).toBe(false);
    });
    it('should return success when not in prod', async () => {
      mocks.env.isProduction = false;
      jest.spyOn(service['snsClient'], 'send').mockReturnValue(of({ $metadata: { httpStatusCode: 200 } }));
      const response = await service.provisionLightningNodes();
      expect(service['snsClient'].send).toHaveBeenCalledTimes(0);
      expect(response.success).toBe(true);
    });
  });

  describe('lockedNodesCheck', () => {
    it("sends email to nodes locked", async () => {
      mocks.db.lightningNodes.find = jest.fn().mockResolvedValue([
        createMock<LightningNodeReference>({tenantId: "tenant-1"}), 
        createMock<LightningNodeReference>({tenantId: "tenant-2"}),
      ]);
      mocks.lndService.getInfo = jest.fn()
        .mockResolvedValueOnce({message: "wallet locked"})
        .mockResolvedValueOnce({})

      mocks.emailService.sendEmail = jest.fn().mockResolvedValue(createMock<Notification>());
      const response = await service.lockedNodesCheck();
      expect(response.success).toBe(true);
    })

    it("should do nothing if no nodes are locked", async () => {
      mocks.db.lightningNodes.find = jest.fn().mockResolvedValue([
        createMock<LightningNodeReference>({tenantId: "tenant-1"}), 
        createMock<LightningNodeReference>({tenantId: "tenant-2"}),
      ]);
      mocks.lndService.getInfo = jest.fn()
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})

      const response = await service.lockedNodesCheck();
      expect(response.success).toBe(true); 
    })
  })
});