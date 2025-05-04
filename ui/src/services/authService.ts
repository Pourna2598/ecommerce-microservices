import { AuthResponse, User } from "../types";
import api from "./api";

// Register a new user
export const register = async (
    name: string,
    email: string,
    password: string
): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/users/register", {
        name,
        email,
        password,
    });
    return response.data;
};

// Login user
export const login = async (
    email: string,
    password: string
): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/users/login", {
        email,
        password,
    });
    return response.data;
};

// Logout user
export const logout = (): void => {
    localStorage.removeItem("userToken");
};

// Get user profile
export const getUserProfile = async (): Promise<User> => {
    const response = await api.get<User>("/users/profile");
    return response.data;
};

// Update user profile
export const updateUserProfile = async (
    userData: Partial<User>
): Promise<User> => {
    const response = await api.put<User>("/users/profile", userData);
    return response.data;
};

// Password reset request
export const requestPasswordReset = async (
    email: string
): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
        "/users/forgot-password",
        { email }
    );
    return response.data;
};

// Reset password with token
export const resetPassword = async (
    token: string,
    password: string
): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
        "/users/reset-password",
        {
            token,
            password,
        }
    );
    return response.data;
};

export const getUserById = async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
};

export const fetchUsers = async (): Promise<User[]> => {
    const response = await api.get<User[]>("/users");
    return response.data;
};

export const deleteUser = async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
};

export const updateUser = async (
    userId: string,
    userData: Partial<User>
): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}`, userData);
    return response.data;
};
