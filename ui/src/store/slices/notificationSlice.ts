import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";

interface Notification {
    _id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    priority: "low" | "normal" | "high" | "urgent";
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
};

export const fetchNotifications = createAsyncThunk(
    "notifications/fetchNotifications",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/notifications");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch notifications"
            );
        }
    }
);

export const markAsRead = createAsyncThunk(
    "notifications/markAsRead",
    async (notificationId: string, { rejectWithValue }) => {
        try {
            const response = await api.put(
                `/notifications/${notificationId}/read`
            );
            return response.data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to mark notification as read"
            );
        }
    }
);

export const getUnreadCount = createAsyncThunk(
    "notifications/getUnreadCount",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/notifications/unread/count");
            return response.data.count;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to get unread count"
            );
        }
    }
);

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.notifications;
                state.unreadCount = action.payload.notifications.filter(
                    (notification: Notification) => !notification.read
                ).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(
                    (n) => n._id === action.payload._id
                );
                if (notification) {
                    notification.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(getUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            });
    },
});

export default notificationSlice.reducer;
