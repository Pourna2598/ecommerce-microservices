import { Product } from "../types";
import api from "./api";

// Get all products with optional pagination and filtering
export const getProducts = async (
    keyword = "",
    pageNumber = 1,
    category = "",
    minPrice?: number,
    maxPrice?: number,
    pageSize: number = 10
): Promise<{
    products: Product[];
    page: number;
    pages: number;
    total: number;
}> => {
    const params = new URLSearchParams({
        keyword,
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        category,
    });

    if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());

    const response = await api.get<{
        products: Product[];
        page: number;
        pages: number;
        total: number;
    }>(`/products?${params.toString()}`);
    return response.data;
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
};

// Create a new product (admin)
export const createProduct = async (
    productData: Partial<Product>
): Promise<Product> => {
    const response = await api.post<Product>("/products", productData);
    return response.data;
};

// Update product (admin)
export const updateProduct = async (
    id: string,
    productData: Partial<Product>
): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, productData);
    return response.data;
};

// Delete product (admin)
export const deleteProduct = async (
    id: string
): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
};

// Create product review
export const createProductReview = async (
    productId: string,
    rating: number,
    comment: string
): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
        `/products/${productId}/reviews`,
        {
            rating,
            comment,
        }
    );
    return response.data;
};

// Get top rated products
export const getTopProducts = async (): Promise<Product[]> => {
    const response = await api.get<Product[]>("/products/top");
    return response.data;
};

// Get products by category
export const getProductsByCategory = async (
    category: string
): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/products/category/${category}`);
    return response.data;
};
