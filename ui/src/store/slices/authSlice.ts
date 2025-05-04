import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as authService from "../../services/authService";

export interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
}

export interface AuthResponse {
    user: User;
    token: string;
}

interface UserState {
    user: User | null;
    users: User[];
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: UserState = {
    user: null,
    users: [],
    loading: false,
    error: null,
};

// Async thunks
export const login = createAsyncThunk(
    "auth/login",
    async (
        { email, password }: { email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const data = await authService.login(email, password);
            // Save token to local storage
            localStorage.setItem("userToken", data.token);
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Authentication failed"
            );
        }
    }
);

export const register = createAsyncThunk(
    "auth/register",
    async (
        {
            name,
            email,
            password,
        }: { name: string; email: string; password: string },
        { rejectWithValue }
    ) => {
        try {
            const data = await authService.register(name, email, password);
            // Save token to local storage
            localStorage.setItem("userToken", data.token);
            return data;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Registration failed"
            );
        }
    }
);

export const getUserProfile = createAsyncThunk(
    "auth/getUserProfile",
    async (_, { rejectWithValue }) => {
        try {
            return await authService.getUserProfile();
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to get user profile"
            );
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    "auth/updateUserProfile",
    async (userData: Partial<User>, { rejectWithValue }) => {
        try {
            return await authService.updateUserProfile(userData);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update user profile"
            );
        }
    }
);

export const logout = createAsyncThunk("auth/logout", async () => {
    authService.logout();
    return {};
});

export const fetchUsers = createAsyncThunk<
    User[],
    void,
    { rejectValue: string }
>("auth/fetchUsers", async (_, { rejectWithValue }) => {
    try {
        const data = await authService.fetchUsers();
        return data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch users"
        );
    }
});

export const deleteUser = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>("auth/deleteUser", async (id: string, { rejectWithValue }) => {
    try {
        await authService.deleteUser(id);
        return id;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to delete user"
        );
    }
});

export const getUserDetails = createAsyncThunk<
    User,
    string,
    { rejectValue: string }
>("auth/getUserDetails", async (id: string, { rejectWithValue }) => {
    try {
        const data = await authService.getUserById(id);
        return data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to fetch user details"
        );
    }
});

export const updateUser = createAsyncThunk<
    User,
    { id: string } & Partial<User>,
    { rejectValue: string }
>("auth/updateUser", async ({ id, ...userData }, { rejectWithValue }) => {
    try {
        const data = await authService.updateUser(id, userData);
        return data;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data?.message || "Failed to update user"
        );
    }
});

// Create the auth slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetLoading: (state) => {
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                login.fulfilled,
                (state, action: PayloadAction<AuthResponse>) => {
                    state.loading = false;
                    state.user = action.payload.user;
                }
            )
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                register.fulfilled,
                (state, action: PayloadAction<AuthResponse>) => {
                    state.loading = false;
                    state.user = action.payload.user;
                }
            )
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get user profile
            .addCase(getUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getUserProfile.fulfilled,
                (state, action: PayloadAction<User>) => {
                    state.loading = false;
                    state.user = action.payload;
                }
            )
            .addCase(getUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update user profile
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                updateUserProfile.fulfilled,
                (state, action: PayloadAction<User>) => {
                    state.loading = false;
                    state.user = action.payload;
                }
            )
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
            })

            // Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchUsers.fulfilled,
                (state, action: PayloadAction<User[]>) => {
                    state.loading = false;
                    state.users = action.payload;
                }
            )
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Delete user
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                deleteUser.fulfilled,
                (state, action: PayloadAction<string>) => {
                    state.loading = false;
                    state.users = state.users.filter(
                        (user: User) => user._id !== action.payload
                    );
                }
            )
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get user details
            .addCase(getUserDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getUserDetails.fulfilled,
                (state, action: PayloadAction<User>) => {
                    state.loading = false;
                    state.user = action.payload;
                }
            )
            .addCase(getUserDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update user
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                updateUser.fulfilled,
                (state, action: PayloadAction<User>) => {
                    state.loading = false;
                    state.user = action.payload;
                    state.users = state.users.map((user) =>
                        user._id === action.payload._id ? action.payload : user
                    );
                }
            )
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, resetLoading } = authSlice.actions;

export default authSlice.reducer;
