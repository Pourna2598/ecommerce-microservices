import { DashboardStats } from "../types";
import api from "./api";

export interface ServiceHealth {
    service: string;
    status: "healthy" | "unhealthy";
    responseTime?: string;
    error?: string;
    timestamp: string;
}

export interface HealthCheckResponse {
    status: "ok" | "error";
    services: ServiceHealth[];
    timestamp: string;
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        const [orderStats, productStats, userStats] = await Promise.all([
            api.get("/orders/admin/stats"),
            api.get("/products/admin/stats"),
            api.get("/users/admin/stats"),
        ]);

        // Transform order stats into the expected format
        const transformedOrderStats = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
        };

        // Map the statusStats array to the expected format
        orderStats.data.statusStats.forEach(
            (stat: { _id: string; count: number }) => {
                transformedOrderStats[
                    stat._id as keyof typeof transformedOrderStats
                ] = stat.count;
            }
        );

        return {
            totalSales: orderStats.data.totalRevenue || 0,
            orderStats: transformedOrderStats,
            totalProducts: productStats.data.totalProducts || 0,
            lowStockProducts: productStats.data.lowStockProducts || [],
            recentOrders: orderStats.data.recentOrders || [],
            userStats: userStats.data || {
                totalUsers: 0,
                totalAdmins: 0,
                totalCustomers: 0,
            },
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
};

// Check health of all services
export const checkHealth = async (): Promise<HealthCheckResponse> => {
    try {
        const response = await api.get("/services/health");
        return response.data;
    } catch (error) {
        console.error("Error checking service health:", error);
        throw error;
    }
};
