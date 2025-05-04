import { Notification } from "../types";
import api from "./api";

// Get user notifications with pagination
export const getUserNotifications = async (
    userId: string,
    page = 1,
    limit = 10,
    isRead?: boolean
): Promise<{
    notifications: Notification[];
    page: number;
    pages: number;
    total: number;
}> => {
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (isRead !== undefined) {
        queryParams.append("isRead", isRead.toString());
    }

    const response = await api.get<{
        notifications: Notification[];
        page: number;
        pages: number;
        total: number;
    }>(`/notifications/user/${userId}?${queryParams.toString()}`);

    return response.data;
};

// Get notification by ID
export const getNotificationById = async (
    id: string
): Promise<Notification> => {
    const response = await api.get<Notification>(`/notifications/${id}`);
    return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (
    id: string
): Promise<Notification> => {
    const response = await api.put<Notification>(
        `/notifications/${id}/read`,
        {}
    );
    return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<{
    success: boolean;
    message: string;
    modifiedCount: number;
}> => {
    const response = await api.put<{
        success: boolean;
        message: string;
        modifiedCount: number;
    }>("/notifications/markAllRead", {});
    return response.data;
};

// Delete notification
export const deleteNotification = async (
    id: string
): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
        `/notifications/${id}`
    );
    return response.data;
};

// Delete all read notifications
export const deleteReadNotifications = async (): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
}> => {
    const response = await api.delete<{
        success: boolean;
        message: string;
        deletedCount: number;
    }>("/notifications/read");
    return response.data;
};

// Create notification (admin)
export const createNotification = async (
    notificationData: Partial<Notification>
): Promise<Notification> => {
    const response = await api.post<Notification>(
        "/notifications",
        notificationData
    );
    return response.data;
};

// Send bulk notifications (admin)
export const sendBulkNotifications = async (
    userIds: string[],
    type: string,
    message: string,
    priority = "normal",
    channel = "in-app"
): Promise<{
    success: boolean;
    message: string;
    count: number;
}> => {
    const response = await api.post<{
        success: boolean;
        message: string;
        count: number;
    }>("/notifications/bulk", {
        userIds,
        type,
        message,
        priority,
        channel,
    });
    return response.data;
};

// Get notification statistics (admin)
export const getNotificationStats = async (): Promise<{
    totalCount: number;
    unreadCount: number;
    readCount: number;
    typeStats: { _id: string; count: number }[];
    channelStats: { _id: string; count: number }[];
    priorityStats: { _id: string; count: number }[];
}> => {
    const response = await api.get<{
        totalCount: number;
        unreadCount: number;
        readCount: number;
        typeStats: { _id: string; count: number }[];
        channelStats: { _id: string; count: number }[];
        priorityStats: { _id: string; count: number }[];
    }>("/notifications/admin/stats");
    return response.data;
};
