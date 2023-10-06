import { Notification } from '@blockspaces/shared/models/platform/Notification';
import { makeAutoObservable, runInAction } from 'mobx';
import { DataStore, IDataStore } from 'src/platform/api';
import { UserNotificationsTransport } from './user-notifications-transport';

export class UserNotificationsStore implements IDataStore {
  notifications: Notification[] = [];

  constructor(
    public readonly dataStore: DataStore,
    private readonly transport: UserNotificationsTransport = UserNotificationsTransport.instance
  ) {
    makeAutoObservable(this);
  }

  get areNotificationsLoaded(): boolean {
    return Boolean(this.notifications?.length);
  }

  reset() {
    this.notifications = [];
  }

  /** loads the catalog of available networks */
  async loadUserNotifications(): Promise<Notification[]> {
    const notifications = await this.transport.fetchUserNotifications();

    this.setNotifications(notifications?.length ? notifications : []);
    return this.notifications;
  }

  setNotifications(catalog: Notification[]) {
    runInAction(() => { this.notifications = catalog });
  }

  async readUserNotification(id: string) {
    await this.transport.readUserNotification(id);
    await this.loadUserNotifications();
  }

  async deleteUserNotification(id: string) {
    await this.transport.deleteUserNotification(id);
    await this.loadUserNotifications();
  }
}