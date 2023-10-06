import { Test, TestingModule } from '@nestjs/testing';
import { FeatureFlagsController } from './FeatureFlagsController';
import { FeatureFlagsService } from '../services/FeatureFlagsService';

describe('FeatureFlagsController', () => {
  let controller: FeatureFlagsController;
  let featureFlagsService: FeatureFlagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeatureFlagsController],
      providers: [
        {
          provide: FeatureFlagsService,
          useValue: {
            getFeatureFlagList: jest.fn(),
            getSystemFeatureFlagList: jest.fn()
          },
        },
      ],
    }).compile();

    controller = module.get<FeatureFlagsController>(FeatureFlagsController);
    featureFlagsService = module.get<FeatureFlagsService>(FeatureFlagsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFlags', () => {
    it('should return a list of feature flags', async () => {
      const featureFlagList = ['flag1', 'flag2'];
      jest.spyOn(featureFlagsService, 'getFeatureFlagList').mockResolvedValue(featureFlagList);

      const result = await controller.getFlags();
      expect(result.data).toEqual(featureFlagList);
      expect(result.message).toEqual("a list of user feature flags");
      expect(result.status).toEqual("success");
    });
  });

  describe('getSystemFlags', () => {
    it('should return a list of system feature flags', async () => {
      const systemFeatureFlagList = [{flag1: true},{flag2: false}];
      jest.spyOn(featureFlagsService, 'getSystemFeatureFlagList').mockResolvedValue(systemFeatureFlagList);

      const result = await controller.getSystemFlags();
      expect(result.data).toEqual(systemFeatureFlagList);
      expect(result.message).toEqual("a list of system feature flags");
      expect(result.status).toEqual("success");
    });
  });

  describe('getUserFlags', () => {
    it('should return the user flags passed through the @UserFeatureFlags() decorator', async () => {
      const userFlags = {flag1: true, flag2: false};
      const result = await controller.getUserFlags(userFlags);
      expect(result).toEqual({
        status: "success",
        data: userFlags,
        message: 'a list of the active user\'s feature flags',
      });
    });
  });

});
