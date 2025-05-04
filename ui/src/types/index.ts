// User Types
export interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
}

export interface UserState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// Product Types
export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categories: string[];
    createdAt: string;

    // Legacy fields for backward compatibility
    image?: string;
    brand?: string;
    category?: string;
    reviews?: Review[];
    rating?: number;
    numReviews?: number;
    countInStock?: number;
    updatedAt?: string;
}

export interface Review {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    user: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductState {
    products: Product[];
    product: Product | null;
    topProducts?: Product[];
    loading: boolean;
    error: string | null;
    page?: number;
    pages?: number;
}

// Order Types
export interface OrderItem {
    _id?: string;
    name: string;
    qty: number;
    image: string;
    price: number;
    product: string;
}

export interface ShippingAddress {
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

export interface PaymentResult {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
}

export interface Order {
    _id: string;
    user: string;
    orderItems: CartItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    paymentResult?: PaymentResult;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    createdAt: string;
    updatedAt: string;
}

export interface OrderState {
    orders: Order[];
    order: Order | null;
    loading: boolean;
    success: boolean;
    error: string | null;
    page: number;
    pages: number;
    total: number;
}

// Cart Types
export interface CartItem {
    product: string;
    name: string;
    price: number;
    countInStock: number;
    qty: number;
}

export interface CartState {
    cartItems: CartItem[];
    shippingAddress: ShippingAddress | null;
    paymentMethod: string | null;
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
}

// Notification Types
export interface Notification {
    _id: string;
    user: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    link?: string;
    createdAt: string;
}

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
}

export interface DashboardStats {
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
