import { UserNotification } from "./UserNotification";
import { createMock } from "ts-auto-mock";
import { Notification } from "@blockspaces/shared/models/platform";

describe(`${UserNotification.name}`, () => {

  let service: UserNotification;
  let mocks: {
    data: Notification
  };

  beforeEach(() => {
    mocks = {
      data: createMock<Notification>()
    };

    service = new UserNotification(mocks.data);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the mock data', () => {
    expect(service.toPayload()).toBe(mocks.data);
  });

});
