import { Badge, Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { NotificationsList } from "./styles/user-notifications-styles";
import { UserNotificationsList } from "./user-notifications-list";
import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundaryPlus, GenericComponentErrorFallback } from "@errors";
import { useNotifications } from "@platform/user-notifications/queries";
import { useReadNotification, useDeleteNotification } from "@platform/user-notifications/mutations";
import ConfirmDialog from "../../dialogs/ConfirmDialog";
import { Notification } from "@blockspaces/shared/models/platform/Notification";
import { useRouter } from "next/router";

const usePageData = () => {
  const { data: notifications, isLoading: notificationsLoading, error: notificationsError } = useNotifications();
  const { mutate: readNotification } = useReadNotification();
  const { mutate: deleteNotification } = useDeleteNotification();

  return {
    notifications,
    notificationsLoading,
    notificationsError,
    readNotification,
    deleteNotification
  };
};

export const UserNotifications = observer(() => {
  const { notifications, readNotification, deleteNotification } = usePageData();
  const notificationListDropdown = useRef<HTMLDivElement>();
  const [showList, setShowList] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification>(null);
  const router = useRouter();

  const closeDropdown = useMemo(
    () => (e: MouseEvent & { target: HTMLElement }) =>
      notificationListDropdown.current && e.target !== notificationListDropdown.current && !notificationListDropdown.current.contains(e.target) ? setShowList(false) : false,
    [notificationListDropdown.current, showList]
  );

  useEffect(() => {
    document.addEventListener("mousedown", closeDropdown);
    return () => {
      document.removeEventListener("mousedown", closeDropdown);
    };
  }, []);

  const deleteUserNotification = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      deleteNotification(id);
    }
  };

  const _close = (event?: object, reason?: string) => {
    if (reason === "escapeKeyDown" || reason === "backdropClick") return;
    readNotification(selectedNotification?._id);
    setSelectedNotification(null);
  };

  return (
    <ErrorBoundaryPlus FallbackComponent={GenericComponentErrorFallback}>
      <Box style={{}}>
        <Badge color="warning" badgeContent={notifications ? notifications.filter((notification) => notification.read === false).length : 0}>
          <NotificationsIcon color="primary" style={{ cursor: "pointer" }} onClick={() => (notifications.length > 0 ? setShowList(!showList) : setShowList(false))} />
        </Badge>
        {showList && (
          <NotificationsList ref={notificationListDropdown} data-visible={showList}>
            <UserNotificationsList
              setSelectedNotification={setSelectedNotification}
              notifications={notifications}
              readUserNotification={readNotification}
              deleteUserNotification={deleteUserNotification}
            />
          </NotificationsList>
        )}
        <ConfirmDialog
          show={selectedNotification != null}
          title={selectedNotification?.title}
          message={selectedNotification?.message}
          onConfirm={() => {
            setSelectedNotification(null);
            router.push(`${selectedNotification?.action_url}`);
          }}
          handleClose={_close}
          secondaryBtnText={"Dismiss"}
          primaryBtnText={"Action"}
        />
      </Box>
    </ErrorBoundaryPlus>
  );
});
