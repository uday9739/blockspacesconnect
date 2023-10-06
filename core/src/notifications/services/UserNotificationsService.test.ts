import { NotificationsService } from "./NotificationsService";
import { createMock } from "ts-auto-mock";
import { Notification } from "@blockspaces/shared/models/platform";
import { ConnectDbDataContext } from "../../connect-db/services/ConnectDbDataContext";
import { NotificationsModule } from "../NotificationsModule";
import { ModuleRef } from "@nestjs/core";
import { UserNotificationsService } from ".";


describe(`${UserNotificationsService.name}`, () => {

  let service: UserNotificationsService;
  let mocks: {
    data: Notification,
    notifications: NotificationsService,
    db: ConnectDbDataContext,
  };

  beforeEach(() => {
    mocks = {
      data: createMock<Notification>(),
      notifications: createMock<NotificationsService>(),
      db: createMock<ConnectDbDataContext>(),
    };

    service = new UserNotificationsService(mocks.db, mocks.notifications);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set the notification read to be false', async () => {
    mocks.notifications.send = async (notification): Promise<Notification> => {
      return Promise.resolve(notification.toPayload() as Notification);
    }
    mocks.data.read = true;
    const responseData = await service.sendUserNotification(mocks.data);
    expect(responseData.read).toBe(false);
  });

  it('should set the notification expiration date to 60 days in the future', async () => {
    const current_date = new Date();
    current_date.setDate(current_date.getDate() + 60);
    const expiration_date = current_date.toISOString().split('T')[0];

    mocks.notifications.send = async (notification): Promise<Notification> => {
      return Promise.resolve(notification.toPayload() as Notification);
    }
    const responseData = await service.sendUserNotification(mocks.data);
    expect(responseData.expiration_date).toBe(expiration_date);
  });

  it('should keep the expiration date I pass in', async () => {
    const current_date = new Date();
    current_date.setDate(current_date.getDate() + 50);
    const expiration_date = current_date.toISOString().split('T')[0];

    mocks.notifications.send = async (notification): Promise<Notification> => {
      return Promise.resolve(notification.toPayload() as Notification);
    }

    mocks.data.expiration_date = expiration_date;
    const responseData = await service.sendUserNotification(mocks.data);
    expect(responseData.expiration_date).toEqual(expiration_date);
  });

  it('should return an empty array', async () => {
    const mockdata = [];
    mocks.db.notifications.find = jest.fn().mockResolvedValue([]);
    const userNotifications = await service.getUserNotifications('test');
    expect(userNotifications).toEqual([]);
  });

  it('should return an array with a length of 2 matching the mock data', async () => {
    mocks.db.notifications.find = jest.fn().mockResolvedValue([
      mocks.data,
      mocks.data
    ]);
    const userNotifications = await service.getUserNotifications('test');
    expect(userNotifications.length).toEqual(2);
    expect(userNotifications).toEqual([
      mocks.data,
      mocks.data
    ]);
  });

});
