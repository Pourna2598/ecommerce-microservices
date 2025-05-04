import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as orderService from "../../services/orderService";
import {
    CartItem,
    Order,
    OrderState,
    PaymentResult,
    ShippingAddress,
} from "../../types";

// Initial state
const initialState: OrderState = {
    orders: [],
    order: null,
    loading: false,
    success: false,
    error: null,
    page: 1,
    pages: 1,
    total: 0,
};

// Async thunks
export const createOrder = createAsyncThunk(
    "orders/createOrder",
    async (
        {
            orderItems,
            shippingAddress,
            paymentMethod = "Pending",
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        }: {
            orderItems: CartItem[];
            shippingAddress: ShippingAddress;
            paymentMethod: string;
            itemsPrice: number;
            taxPrice: number;
            shippingPrice: number;
            totalPrice: number;
        },
        { rejectWithValue }
    ) => {
        try {
            return await orderService.createOrder(
                orderItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice
            );
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create order"
            );
        }
    }
);

export const getOrderDetails = createAsyncThunk(
    "orders/getOrderDetails",
    async (id: string, { rejectWithValue }) => {
        try {
            return await orderService.getOrderById(id);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to get order details"
            );
        }
    }
);

export const payOrder = createAsyncThunk(
    "orders/payOrder",
    async (
        { id, paymentResult }: { id: string; paymentResult: PaymentResult },
        { rejectWithValue }
    ) => {
        try {
            return await orderService.updateOrderToPaid(id, paymentResult);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to update order payment"
            );
        }
    }
);

export const listMyOrders = createAsyncThunk(
    "orders/listMyOrders",
    async (_, { rejectWithValue }) => {
        try {
            return await orderService.getMyOrders();
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to get your orders"
            );
        }
    }
);

export const listAllOrders = createAsyncThunk(
    "orders/listAllOrders",
    async (
        { pageNumber = 1, limit = 10 }: { pageNumber?: number; limit?: number },
        { rejectWithValue }
    ) => {
        try {
            return await orderService.getAllOrders(pageNumber, limit);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to get all orders"
            );
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    "orders/updateOrderStatus",
    async (
        { id, status }: { id: string; status: string },
        { rejectWithValue }
    ) => {
        try {
            return await orderService.updateOrderStatus(id, status);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update order status"
            );
        }
    }
);

export const cancelOrder = createAsyncThunk(
    "orders/cancelOrder",
    async (
        { id, reason }: { id: string; reason: string },
        { rejectWithValue }
    ) => {
        try {
            return await orderService.cancelOrder(id, reason);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to cancel order"
            );
        }
    }
);

export const fetchAllOrders = createAsyncThunk(
    "orders/fetchAll",
    async (
        { pageNumber = 1 }: { pageNumber?: number },
        { rejectWithValue }
    ) => {
        try {
            return await orderService.getAllOrders(pageNumber);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch orders"
            );
        }
    }
);

export const fetchOrderById = createAsyncThunk(
    "orders/fetchById",
    async (id: string, { rejectWithValue }) => {
        try {
            return await orderService.getOrderById(id);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch order"
            );
        }
    }
);

// Create the order slice
const orderSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {
        resetOrderSuccess: (state) => {
            state.success = false;
        },
        resetOrderDetails: (state) => {
            state.order = null;
            state.error = null;
        },
        clearOrderError: (state) => {
            state.error = null;
        },
        resetOrder: (state) => {
            state.order = null;
            state.success = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                createOrder.fulfilled,
                (state, action: PayloadAction<Order>) => {
                    state.loading = false;
                    state.success = true;
                    state.order = action.payload;
                }
            )
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get order details
            .addCase(getOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getOrderDetails.fulfilled,
                (state, action: PayloadAction<Order>) => {
                    state.loading = false;
                    state.order = action.payload;
                }
            )
            .addCase(getOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Pay order
            .addCase(payOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                payOrder.fulfilled,
                (state, action: PayloadAction<Order>) => {
                    state.loading = false;
                    state.success = true;
                    state.order = action.payload;
                }
            )
            .addCase(payOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // List my orders
            .addCase(listMyOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                listMyOrders.fulfilled,
                (state, action: PayloadAction<Order[]>) => {
                    state.loading = false;
                    state.orders = action.payload;
                }
            )
            .addCase(listMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // List all orders (admin)
            .addCase(listAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(listAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
            })
            .addCase(listAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update order status
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                updateOrderStatus.fulfilled,
                (state, action: PayloadAction<Order>) => {
                    state.loading = false;
                    state.success = true;
                    if (state.order && state.order._id === action.payload._id) {
                        state.order = action.payload;
                    }
                    state.orders = state.orders.map((order) =>
                        order._id === action.payload._id
                            ? action.payload
                            : order
                    );
                }
            )
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Cancel order
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                cancelOrder.fulfilled,
                (state, action: PayloadAction<Order>) => {
                    state.loading = false;
                    state.success = true;
                    if (state.order && state.order._id === action.payload._id) {
                        state.order = action.payload;
                    }
                    state.orders = state.orders.map((order) =>
                        order._id === action.payload._id
                            ? action.payload
                            : order
                    );
                }
            )
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch all orders
            .addCase(fetchAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
                state.total = action.payload.total;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch order by ID
            .addCase(fetchOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(fetchOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    resetOrderSuccess,
    resetOrderDetails,
    clearOrderError,
    resetOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
