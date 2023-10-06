import { HaproxyService } from './HaproxyService';
import { HaproxyApiService } from './HaproxyApiService';
import { createMock } from "ts-auto-mock";

describe('HaproxyService', () => {
  let haproxyService: HaproxyService;
  let haproxyClientMock: HaproxyApiService;

  beforeEach(() => {
    haproxyClientMock = createMock<HaproxyApiService>({
      addMapEntry: () => {
        return Promise.resolve();
      },
      getMapEntries: () => {
        return Promise.resolve([{ key: 'key1' }, { key: 'key2' }]);
      },
      deleteMapEntry: () => {
        return Promise.resolve();
      },
    });
    haproxyService = new HaproxyService(haproxyClientMock);
  });

  describe('getMapEntries', () => {
    it('should return an array of keys', async () => {
      const keys = await haproxyService.getMapEntries();
      expect(keys).toEqual([{ key: 'key1' }, { key: 'key2' }]);
    });
  });

  describe('getStatus', () => {
    it('should return true if there are map entries', async () => {
      const status = await haproxyService.getStatus();
      expect(status).toBe(true);
    });
  });


});
