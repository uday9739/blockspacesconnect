import ApiResult from "@blockspaces/shared/models/ApiResult";
import { Notification } from "@blockspaces/shared/models/platform";
import { IUser } from "@blockspaces/shared/models/users";
import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { User } from "../../users";
import { UserNotificationsService } from "../services";

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly userNotificationsService: UserNotificationsService) { }

  /**
   * 
   * CreateUserNotification - Create a User Notification
   * 
   * @body {@link Notification} - The Notification to be created
   * 
   * @returns Promise {@link Notification}
   * 
   */
  @Post("/user")
  async createUserNotification(@Body() data: Notification): Promise<ApiResult<Notification>> {
    const notification = await this.userNotificationsService.sendUserNotification(data);
    return ApiResult.success(notification);
  }

  /**
   * 
   * GetUserNotifications - Get all of the User Notifications for the logged in user
   * 
   * @returns Promise [{@link Notification}] - Array of the Notifications for the logged in user
   * 
   */
  @Get("/user")
  async getUserNotifications(@User() user: IUser): Promise<ApiResult<Notification[]>> {
    const notifications = await this.userNotificationsService.getUserNotifications(user.id);
    return ApiResult.success(notifications);
  }

  /**
   * 
   * ReadUserNotification - Mark a specific Notification as read
   * 
   * @param  {string} id - ID of the Notification
   * 
   * @returns Promise {@link Notification}
   * 
   */
  @Put("/user/read/:id")
  async readUserNotification(@Param("id") id: string): Promise<ApiResult<Notification>> {
    const notification = await this.userNotificationsService.readUserNotification(id);
    return ApiResult.success(notification);
  }

  /**
   * 
   * DeleteUserNotification - Delete a notification
   * 
   * @param  {string} id - ID of the Notification
   * 
   * @returns Promise {@link Notification}
   * 
   */
  @Delete("/user/:id")
  async deleteUserNotification(@Param("id") id: string): Promise<ApiResult<void>> {
    await this.userNotificationsService.deleteUserNotification(id);
    return ApiResult.success();
  }

}
