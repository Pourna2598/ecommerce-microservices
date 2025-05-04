import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    Notifications as NotificationsIcon,
    NotificationsNone as NotificationsNoneIcon,
    Refresh as RefreshIcon,
    Warning as WarningIcon,
} from "@mui/icons-material";
import {
    Badge,
    Box,
    CircularProgress,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Popover,
    Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchNotifications,
    markAsRead,
} from "../store/slices/notificationSlice";
import { AppDispatch, RootState } from "../store/store";

interface Notification {
    _id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    priority: "low" | "normal" | "high" | "urgent";
}

const Notifications: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { notifications, unreadCount, loading } = useSelector(
        (state: RootState) => state.notifications
    );

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notificationId: string) => {
        await dispatch(markAsRead(notificationId));
    };

    const handleRefresh = () => {
        dispatch(fetchNotifications());
    };

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const open = Boolean(anchorEl);
    const id = open ? "notifications-popover" : undefined;

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "urgent":
                return <ErrorIcon color="error" />;
            case "high":
                return <WarningIcon color="warning" />;
            case "normal":
                return <InfoIcon color="info" />;
            case "low":
                return <CheckCircleIcon color="success" />;
            default:
                return <InfoIcon />;
        }
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleClick}
                aria-describedby={id}
            >
                <Badge badgeContent={unreadCount} color="error">
                    {unreadCount > 0 ? (
                        <NotificationsIcon />
                    ) : (
                        <NotificationsNoneIcon />
                    )}
                </Badge>
            </IconButton>

            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                slotProps={{
                    paper: {
                        style: {
                            maxWidth: 500,
                        },
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h6">Notifications</Typography>
                        <IconButton onClick={handleRefresh}>
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    {loading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                p: 2,
                            }}
                        >
                            <CircularProgress size={24} />
                        </Box>
                    ) : notifications.length === 0 ? (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ p: 2, textAlign: "center" }}
                        >
                            No notifications
                        </Typography>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {notifications.map((notification: Notification) => (
                                <ListItem
                                    key={notification._id}
                                    button
                                    onClick={() =>
                                        handleNotificationClick(
                                            notification._id
                                        )
                                    }
                                    sx={{
                                        backgroundColor: notification.read
                                            ? "transparent"
                                            : "rgba(25, 118, 210, 0.08)",
                                        borderLeft: notification.read
                                            ? "none"
                                            : "4px solid #1976d2",
                                        "&:hover": {
                                            backgroundColor: notification.read
                                                ? "action.hover"
                                                : "rgba(25, 118, 210, 0.12)",
                                        },
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                <Typography variant="subtitle1">
                                                    {notification.title}
                                                </Typography>
                                                {getPriorityIcon(
                                                    notification.priority
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.primary"
                                                >
                                                    {notification.message}
                                                </Typography>
                                                <br />
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            notification.createdAt
                                                        ),
                                                        { addSuffix: true }
                                                    )}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default Notifications;
