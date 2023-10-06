import { FeatureFlagsService } from './FeatureFlagsService';
import {SystemFeatureFlagsService} from "./SystemFeatureFlagsService";
import { Test, TestingModule } from '@nestjs/testing';
import { getDefaultFeatureFlags } from '@blockspaces/shared/models/feature-flags/FeatureFlags';
import { BadRequestException } from '../../exceptions/common';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;
  let sysFlagsMock: SystemFeatureFlagsService;

  beforeEach(async () => {
    sysFlagsMock = {
      getSystemFeatureFlagsFromDb: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagsService,
        { provide: SystemFeatureFlagsService, useValue: sysFlagsMock },
      ],
    }).compile();

    service = module.get<FeatureFlagsService>(FeatureFlagsService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFeatureFlagList', () => {
    it('should return a list of feature flags', async () => {
      const featureFlags = getDefaultFeatureFlags();
      const expected = Object.keys(featureFlags);

      const result = await service.getFeatureFlagList();
      expect(result).toEqual(expected);
    });

    it('should throw a BadRequestException if there is an error retrieving the list of feature flags', async () => {
      const error = new Error('Some error occurred');

      jest.mock('@blockspaces/shared/models/feature-flags/FeatureFlags', () => {
        return {
          getDefaultFeatureFlags: jest.fn(() => { throw error; })
        };
      });

      try {
        await service.getFeatureFlagList();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Unable to retrieve list of feature flags');
        expect(e.cause).toEqual(error);
      }
    });
  });

  describe('getSystemFeatureFlagList', () => {
    it('should return a list of system feature flags', async () => {
      const systemFeatureFlags = [{ flag1: true }, { flag2: false }];
      (sysFlagsMock.getSystemFeatureFlagsFromDb as jest.Mock).mockResolvedValue(systemFeatureFlags);

      const result = await service.getSystemFeatureFlagList();
      expect(result).toEqual(systemFeatureFlags);
      expect(sysFlagsMock.getSystemFeatureFlagsFromDb).toHaveBeenCalled();
    });
    it('should throw a BadRequestException if there is an error retrieving the list of system feature flags', async () => {
      const error = new Error('Some error occurred');
      (sysFlagsMock.getSystemFeatureFlagsFromDb as jest.Mock).mockImplementation(()=>{throw error;})

      try {
        await service.getSystemFeatureFlagList();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Unable to retrieve list of system feature flags');
        expect(e.cause).toEqual(error);
      }
    });
  });
});
