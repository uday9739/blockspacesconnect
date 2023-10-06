import { Test, TestingModule } from '@nestjs/testing';
import { SystemFeatureFlagsService } from './SystemFeatureFlagsService';
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";


describe('SystemFeatureFlagsService', () => {
  let service: SystemFeatureFlagsService;
  let connectDbDataContext: ConnectDbDataContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemFeatureFlagsService,
        {
          provide: ConnectDbDataContext,
          useValue: {
            systemMaintenance: {
              find: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SystemFeatureFlagsService>(SystemFeatureFlagsService);
    connectDbDataContext = module.get<ConnectDbDataContext>(ConnectDbDataContext);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSystemFeatureFlagsFromDb', () => {
    it('should return a list of system feature flags', async () => {
      const systemFeatureFlagList = [
        { _id: "639a2f280dccf85164601269", maintenance: true, toJSON: {} },
        { _id: "63c6f25c16368e451a7288a7", cyclrSystem: false, toJSON: {} },
      ];
      systemFeatureFlagList.forEach((item) => {
        item.toJSON = jest.fn().mockReturnValue([{ flag1: true }, { flag2: false }]);
      });
      // @ts-ignore
      jest.spyOn(connectDbDataContext.systemMaintenance, 'find').mockResolvedValue(systemFeatureFlagList);

      const result = await service.getSystemFeatureFlagsFromDb();
      expect(result).toHaveLength(2);
    });

    it('should throw a BadRequestException if there is an error retrieving the list of system feature flags', async () => {
      jest.spyOn(connectDbDataContext.systemMaintenance, 'find').mockRejectedValue(new Error('Test error'));

      try {
        await service.getSystemFeatureFlagsFromDb();
      } catch (error) {
        expect(error.message).toEqual('Unable to retrieve list of system feature flags');
        expect(error.cause.message).toEqual('Test error');
      }
    });
  });
});
