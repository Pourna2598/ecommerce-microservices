import { CartItem, Order, PaymentResult, ShippingAddress } from "../types";
import api from "./api";

// Create a new order
export const createOrder = async (
    orderItems: CartItem[],
    shippingAddress: ShippingAddress,
    paymentMethod: string,
    itemsPrice: number,
    taxPrice: number,
    shippingPrice: number,
    totalPrice: number
): Promise<Order> => {
    const response = await api.post<Order>("/orders", {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });
    return response.data;
};

// Get order by ID
export const getOrderById = async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
};

// Update order to paid
export const updateOrderToPaid = async (
    id: string,
    paymentResult: PaymentResult
): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}/pay`, paymentResult);
    return response.data;
};

// Update order status
export const updateOrderStatus = async (
    id: string,
    status: string
): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}/status`, { status });
    return response.data;
};

// Cancel order
export const cancelOrder = async (
    id: string,
    reason: string
): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}/cancel`, { reason });
    return response.data;
};

// Get logged in user's orders
export const getMyOrders = async (): Promise<Order[]> => {
    const response = await api.get<Order[]>("/orders/myorders");
    return response.data;
};

// Get all orders (admin)
export const getAllOrders = async (
    pageNumber = 1,
    limit = 10
): Promise<{
    orders: Order[];
    page: number;
    pages: number;
    total: number;
}> => {
    const response = await api.get<{
        orders: Order[];
        page: number;
        pages: number;
        total: number;
    }>(`/orders?pageNumber=${pageNumber}&limit=${limit}`);
    return response.data;
};

// Get order statistics (admin)
export const getOrderStats = async (): Promise<any> => {
    const response = await api.get("/orders/admin/stats");
    return response.data;
};

// Get user orders (admin)
export const getUserOrders = async (userId: string): Promise<Order[]> => {
    const response = await api.get<Order[]>(`/orders/user/${userId}`);
    return response.data;
};

export const fetchAllOrders = async (): Promise<{
    orders: Order[];
    page: number;
    pages: number;
    total: number;
}> => {
    const response = await api.get<{
        orders: Order[];
        page: number;
        pages: number;
        total: number;
    }>("/orders");
    return response.data;
};
