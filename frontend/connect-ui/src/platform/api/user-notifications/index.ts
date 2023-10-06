import ApiResult from "@blockspaces/shared/models/ApiResult";
import { getApiUrl } from "@src/platform/utils";
import { Notification } from "@blockspaces/shared/models/platform";
import axios from "axios"

export async function fetchUserNotifications(): Promise<Notification[]> {
  const { data: apiResult } = await axios.get<ApiResult<Notification[]>>(getApiUrl("/notifications/user"))
  return apiResult.data;
}

export async function readUserNotification(id: string): Promise<Notification> {
  const { data: apiResult } = await axios.put<ApiResult<Notification>>(getApiUrl(`/notifications/user/read/${id}`));
  return apiResult.data;
}

export async function deleteUserNotification(id: string): Promise<void> {
  await axios.delete<ApiResult<Notification>>(getApiUrl(`/notifications/user/${id}`));
  return;
}
