import { Notification } from '@blockspaces/shared/models/platform/Notification'

import { BaseHttpTransport } from 'src/platform/api'
import { getApiUrl } from 'src/platform/utils';
import ApiResult from '@blockspaces/shared/models/ApiResult';

export class UserNotificationsTransport extends BaseHttpTransport {

  static readonly instance: UserNotificationsTransport = new UserNotificationsTransport();

  async fetchUserNotifications(): Promise<Notification[]> {
    const { data: apiResult } = await this.httpService.get<ApiResult<Notification[]>>(getApiUrl("/notifications/user"))
    return apiResult.data;
  }

  async readUserNotification(id: string): Promise<Notification> {
    const { data: apiResult } = await this.httpService.put<ApiResult<Notification>>(getApiUrl(`/notifications/user/read/${id}`));
    return apiResult.data;
  }

  async deleteUserNotification(id: string): Promise<void> {
    await this.httpService.delete<ApiResult<Notification>>(getApiUrl(`/notifications/user/${id}`));
    return;
  }

}