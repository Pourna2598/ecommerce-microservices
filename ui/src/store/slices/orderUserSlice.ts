import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as authService from "../../services/authService";
import { User } from "../../types";
export const fetchOrderUser = createAsyncThunk(
    "orderUser/fetchOrderUser",
    async (userId: string, { rejectWithValue }) => {
        try {
            return await authService.getUserById(userId);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch user details"
            );
        }
    }
);

interface OrderUserState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: OrderUserState = {
    user: null,
    loading: false,
    error: null,
};

const orderUserSlice = createSlice({
    name: "orderUser",
    initialState,
    reducers: {
        clearOrderUser: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrderUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(fetchOrderUser.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch user details";
            });
    },
});

export const { clearOrderUser } = orderUserSlice.actions;
export default orderUserSlice.reducer;
