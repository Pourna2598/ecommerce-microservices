import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as productService from "../../services/productService";
import { Product, ProductState } from "../../types";

// Initial state
const initialState: ProductState = {
    products: [],
    product: null,
    topProducts: [],
    loading: false,
    error: null,
    page: 1,
    pages: 1,
};

// Async thunks
export const fetchProducts = createAsyncThunk(
    "products/fetchProducts",
    async (
        {
            keyword = "",
            pageNumber = 1,
            category = "",
            minPrice,
            maxPrice,
            pageSize = 10,
        }: {
            keyword?: string;
            pageNumber?: number;
            category?: string;
            minPrice?: number;
            maxPrice?: number;
            pageSize?: number;
        },
        { rejectWithValue }
    ) => {
        try {
            return await productService.getProducts(
                keyword,
                pageNumber,
                category,
                minPrice,
                maxPrice,
                pageSize
            );
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch products"
            );
        }
    }
);

export const fetchProductDetails = createAsyncThunk(
    "products/fetchProductDetails",
    async (id: string, { rejectWithValue }) => {
        try {
            return await productService.getProductById(id);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message ||
                    "Failed to fetch product details"
            );
        }
    }
);

export const createProduct = createAsyncThunk(
    "products/createProduct",
    async (productData: Partial<Product>, { rejectWithValue }) => {
        try {
            return await productService.createProduct(productData);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create product"
            );
        }
    }
);

export const updateProduct = createAsyncThunk(
    "products/updateProduct",
    async (
        { id, productData }: { id: string; productData: Partial<Product> },
        { rejectWithValue }
    ) => {
        try {
            return await productService.updateProduct(id, productData);
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update product"
            );
        }
    }
);

export const deleteProduct = createAsyncThunk(
    "products/deleteProduct",
    async (id: string, { rejectWithValue }) => {
        try {
            await productService.deleteProduct(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to delete product"
            );
        }
    }
);

export const fetchTopProducts = createAsyncThunk(
    "products/fetchTopProducts",
    async (_, { rejectWithValue }) => {
        try {
            return await productService.getTopProducts();
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch top products"
            );
        }
    }
);

// Create the product slice
const productSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        clearProductDetails: (state) => {
            state.product = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch products
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    // Handle case where API returns array directly
                    state.products = action.payload;
                    state.page = 1;
                    state.pages = 1;
                } else {
                    // Handle case where API returns object with pagination
                    state.products = action.payload?.products || [];
                    state.page = action.payload?.page || 1;
                    state.pages = action.payload?.pages || 1;
                }
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.products = [];
            })

            // Fetch product details
            .addCase(fetchProductDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload;
            })
            .addCase(fetchProductDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Create product
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update product
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex(
                    (product) => product._id === action.payload._id
                );
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
                state.product = action.payload;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Delete product
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter(
                    (product) => product._id !== action.payload
                );
                if (state.product && state.product._id === action.payload) {
                    state.product = null;
                }
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch top products
            .addCase(fetchTopProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTopProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.topProducts = action.payload;
            })
            .addCase(fetchTopProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearProductDetails, clearError } = productSlice.actions;

export default productSlice.reducer;
