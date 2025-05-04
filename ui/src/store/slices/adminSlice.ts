import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    checkHealth,
    getDashboardStats,
    HealthCheckResponse,
} from "../../services/adminService";

interface DashboardStats {
    totalSales: number;
    orderStats: {
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    userStats: {
        totalUsers: number;
        totalAdmins: number;
        totalCustomers: number;
    };
    totalProducts: number;
    recentOrders: {
        _id: string;
        totalPrice: number;
        status: string;
        createdAt: string;
        userId: string;
        userEmail: string;
    }[];
    lowStockProducts: {
        _id: string;
        name: string;
        stockQuantity: number;
        price: number;
    }[];
}

interface AdminState {
    stats: DashboardStats | null;
    health: HealthCheckResponse | null;
    loading: boolean;
    healthLoading: boolean;
    error: string | null;
    healthError: string | null;
}

const initialState: AdminState = {
    stats: null,
    health: null,
    loading: false,
    healthLoading: false,
    error: null,
    healthError: null,
};

export const fetchDashboardStats = createAsyncThunk(
    "admin/fetchDashboardStats",
    async (_, { rejectWithValue }) => {
        try {
            const stats = await getDashboardStats();
            return stats;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to fetch dashboard stats"
            );
        }
    }
);

export const fetchHealthStatus = createAsyncThunk(
    "admin/fetchHealthStatus",
    async (_, { rejectWithValue }) => {
        try {
            const health = await checkHealth();
            return health;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch health status"
            );
        }
    }
);

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Dashboard Stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Health Status
            .addCase(fetchHealthStatus.pending, (state) => {
                state.healthLoading = true;
                state.healthError = null;
            })
            .addCase(fetchHealthStatus.fulfilled, (state, action) => {
                state.healthLoading = false;
                state.health = action.payload;
            })
            .addCase(fetchHealthStatus.rejected, (state, action) => {
                state.healthLoading = false;
                state.healthError = action.payload as string;
            });
    },
});

export default adminSlice.reducer;
