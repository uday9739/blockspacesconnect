import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { ListItemIcon, Popover } from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { Notification } from "@blockspaces/shared/models/platform/Notification";
import { observer } from "mobx-react-lite";

export type UserNotificationsUIProps = {
  notifications: Notification[];
  readUserNotification: any;
  deleteUserNotification: any;
  setSelectedNotification: any;
};

export const UserNotificationsList = ({ notifications, readUserNotification, deleteUserNotification, setSelectedNotification }: UserNotificationsUIProps) => {
  const openPopover = (event: React.MouseEvent<HTMLDivElement>, notification: Notification) => {
    setSelectedNotification(notification);
    readUserNotification(notification._id);
  };

  if (notifications.length > 0) {
    return (
      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        <>
          {notifications &&
            notifications.map((notification, idx) => {
              const fontWeight = notification.read ? "normal" : "bold";
              return (
                <div key={`notificationsList_${notification._id}`}>
                  <ListItem alignItems="center" key={notification._id}>
                    <ListItemIcon onClick={() => deleteUserNotification(notification._id)}>
                      <HighlightOffIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      onClick={(e) => openPopover(e, notification)}
                      primary={notification.title}
                      primaryTypographyProps={{ variant: "h6", sx: { fontWeight: { fontWeight } } }}
                      secondaryTypographyProps={{ variant: "subtitle1", sx: { fontWeight: { fontWeight } } }}
                      secondary={notification.message.length > 50 ? `${notification.message.substring(0, 50)} ...` : notification.message}
                    />
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider variant="middle" component="li" key={`divider_${notification._id}`} />}
                </div>
              );
            })}
        </>
      </List>
    );
  } else {
    return <>No messages</>;
  }
};
