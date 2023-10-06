import { checkHaproxyStatus } from './checkHaproxyStatus';
import { PlatformStatus } from "@blockspaces/shared/models/platform";
import { HaproxyService } from '../../haproxy';
import { createMock} from "ts-auto-mock";

const haproxyClientMock = createMock<HaproxyService>({
  getStatus(): Promise<Boolean> {
    return Promise.resolve(true);
  },
});

describe("checkHaproxyStatus", () => {
  it(".checkHaproxyStatus() to return normal when the service is available", async () => {
    expect(await checkHaproxyStatus(haproxyClientMock)).toEqual(PlatformStatus.normal);
  });
  it(".checkHaproxyStatus() to return down when the service is not available", async () => {
    haproxyClientMock.getStatus = async () => {return Promise.resolve(false);};
    expect(await checkHaproxyStatus(haproxyClientMock)).toEqual(PlatformStatus.down);
  });
  it(".checkHaproxyStatus() to catch error", async () => {
    haproxyClientMock.getStatus = async () => {
      throw new Error("an error in checkHaproxyStatus");
    };
    expect(await checkHaproxyStatus(haproxyClientMock)).toEqual(PlatformStatus.down);
  });
});

