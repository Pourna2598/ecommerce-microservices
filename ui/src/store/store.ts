import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import slices
import adminReducer from "./slices/adminSlice";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import notificationReducer from "./slices/notificationSlice";
import orderReducer from "./slices/orderSlice";
import orderUserReducer from "./slices/orderUserSlice";
import productReducer from "./slices/productSlice";

// Combine reducers
const rootReducer = combineReducers({
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    notifications: notificationReducer,
    admin: adminReducer,
    orderUser: orderUserReducer,
});

// Migration to ensure loading state is reset on rehydration
const authMigrate = (state: any) => {
    // Return a new state with loading set to false
    if (state && state.auth) {
        return {
            ...state,
            auth: {
                ...state.auth,
                loading: false,
                error: null,
                users: [], // Always reset users array on rehydration
            },
        };
    }
    return state;
};

// Configure persistence
const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth"], // Only persist auth
    migrate: authMigrate,
    transforms: [
        // Add a transform to exclude users from persistence
        {
            in: (state: any) => {
                if (state.auth) {
                    const { users, ...rest } = state.auth;
                    return { ...state, auth: rest };
                }
                return state;
            },
            out: (state: any) => {
                if (state.auth) {
                    return {
                        ...state,
                        auth: {
                            ...state.auth,
                            users: [],
                        },
                    };
                }
                return state;
            },
        },
    ],
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
});

export const persistor = persistStore(store);

// Extract RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
