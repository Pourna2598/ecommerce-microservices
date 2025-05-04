import {
    Close as CloseIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
    DoneAll as MarkReadIcon,
    Refresh as RefreshIcon,
    CheckCircle as SuccessIcon,
    Warning as WarningIcon,
} from "@mui/icons-material";
import {
    Badge,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchUserNotifications,
    markAllAsRead,
    markAsRead,
} from "../store/slices/notificationSlice";
import { AppDispatch, RootState } from "../store/store";
import { Notification } from "../types";
import Loader from "./Loader";

interface NotificationsPanelProps {
    open: boolean;
    onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
    open,
    onClose,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);

    const { notifications, loading, error, unreadCount } = useSelector(
        (state: RootState) => state.notifications
    );

    useEffect(() => {
        if (open && user) {
            dispatch(fetchUserNotifications(user._id));
        }
    }, [dispatch, open, user]);

    const handleRefresh = () => {
        if (user) {
            dispatch(fetchUserNotifications(user._id));
        }
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read
        if (!notification.read) {
            dispatch(markAsRead(notification._id));
        }

        // Navigate to the link if provided
        if (notification.link) {
            navigate(notification.link);
            onClose();
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "success":
                return <SuccessIcon color="success" />;
            case "error":
                return <ErrorIcon color="error" />;
            case "warning":
                return <WarningIcon color="warning" />;
            default:
                return <InfoIcon color="info" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: "100%", sm: 400 } },
            }}
        >
            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h6">
                    Notifications
                    {unreadCount > 0 && (
                        <Badge
                            color="primary"
                            badgeContent={unreadCount}
                            sx={{ ml: 1 }}
                        />
                    )}
                </Typography>
                <Box>
                    <Tooltip title="Refresh">
                        <IconButton
                            onClick={handleRefresh}
                            size="small"
                            sx={{ mr: 1 }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Mark all as read">
                        <IconButton
                            onClick={handleMarkAllAsRead}
                            size="small"
                            sx={{ mr: 1 }}
                            disabled={unreadCount === 0}
                        >
                            <MarkReadIcon />
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            <Divider />

            <Box sx={{ overflow: "auto", maxHeight: "calc(100vh - 64px)" }}>
                {loading ? (
                    <Box
                        sx={{ p: 4, display: "flex", justifyContent: "center" }}
                    >
                        <Loader size={40} />
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 2, textAlign: "center" }}>
                        <Typography color="error" gutterBottom>
                            {error}
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleRefresh}
                            size="small"
                        >
                            Try Again
                        </Button>
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant="body1" color="text.secondary">
                            No notifications yet
                        </Typography>
                    </Box>
                ) : (
                    <List>
                        {notifications.map((notification) => (
                            <React.Fragment key={notification._id}>
                                <ListItem
                                    button
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    sx={{
                                        bgcolor: notification.read
                                            ? "inherit"
                                            : "action.hover",
                                        transition: "background-color 0.2s",
                                    }}
                                >
                                    <ListItemIcon>
                                        {getNotificationIcon(notification.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight:
                                                        notification.read
                                                            ? "normal"
                                                            : "bold",
                                                }}
                                            >
                                                {notification.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography
                                                    variant="body2"
                                                    component="span"
                                                    display="block"
                                                >
                                                    {notification.message}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    {formatDate(
                                                        notification.createdAt
                                                    )}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Box>
        </Drawer>
    );
};

export default NotificationsPanel;
