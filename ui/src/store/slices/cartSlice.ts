import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartState, Product, ShippingAddress } from "../../types";

// Initial state
const initialState: CartState = {
    cartItems: [],
    shippingAddress: null,
    paymentMethod: null,
    itemsPrice: 0,
    taxPrice: 0,
    shippingPrice: 0,
    totalPrice: 0,
};

// Calculate prices
const calculatePrices = (state: CartState) => {
    // Items price
    state.itemsPrice = state.cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    );
    // Tax price (10% tax)
    state.taxPrice = parseFloat((state.itemsPrice * 0.1).toFixed(2));
    // Shipping price (free shipping for orders over ₹100)
    state.shippingPrice = state.itemsPrice > 100 ? 0 : 10;
    // Total price
    state.totalPrice = state.itemsPrice + state.taxPrice + state.shippingPrice;
};

// Create the cart slice
const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (
            state,
            action: PayloadAction<{ product: Product; qty: number }>
        ) => {
            const { product, qty } = action.payload;
            const existingItem = state.cartItems.find(
                (item) => item.product === product._id
            );

            if (existingItem) {
                // If item already exists, update qty
                existingItem.qty = qty;
            } else {
                // Add new item
                state.cartItems.push({
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    countInStock: product.stockQuantity,
                    qty,
                });
            }

            calculatePrices(state);
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cartItems = state.cartItems.filter(
                (item) => item.product !== action.payload
            );
            calculatePrices(state);
        },
        updateCartQuantity: (
            state,
            action: PayloadAction<{ id: string; qty: number }>
        ) => {
            const { id, qty } = action.payload;
            const item = state.cartItems.find((item) => item.product === id);

            if (item) {
                item.qty = qty;
                calculatePrices(state);
            }
        },
        saveShippingAddress: (
            state,
            action: PayloadAction<ShippingAddress>
        ) => {
            state.shippingAddress = action.payload;
        },
        savePaymentMethod: (state, action: PayloadAction<string>) => {
            state.paymentMethod = action.payload;
        },
        clearCartItems: (state) => {
            state.cartItems = [];
            calculatePrices(state);
        },
        resetCart: () => initialState,
    },
});

export const {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    saveShippingAddress,
    savePaymentMethod,
    clearCartItems,
    resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
