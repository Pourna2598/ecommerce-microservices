import api from "./api";

export interface CardDetails {
    cardNumber: string;
    cardName: string;
    expDate: string;
    cvv: string;
    otp: string;
}

export interface PaymentRequest {
    orderId: string;
    amount: number;
    paymentMethod: string;
    cardDetails: CardDetails;
}

export interface PaymentResult {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
}

export interface PaymentResponse {
    success: boolean;
    id: string;
    status: string;
    timestamp: string;
    transactionId: string;
}

/**
 * Process a payment for an order
 * @param paymentData Payment request data
 * @returns Promise with payment response
 */
export const processPayment = async (
    paymentData: PaymentRequest
): Promise<PaymentResponse> => {
    try {
        const { data } = await api.post("/payments/process", paymentData);
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get payment details by ID
 * @param id Payment ID
 * @returns Promise with payment details
 */
export const getPaymentById = async (id: string) => {
    try {
        const { data } = await api.get(`/payments/${id}`);
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get payment history for the current user
 * @param page Page number for pagination
 * @returns Promise with payment history
 */
export const getPaymentHistory = async (page = 1) => {
    try {
        const { data } = await api.get(`/payments/history?page=${page}`);
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Request a refund for a payment
 * @param id Payment ID to refund
 * @returns Promise with refund result
 */
export const requestRefund = async (id: string) => {
    try {
        const { data } = await api.post(`/payments/${id}/refund`);
        return data;
    } catch (error) {
        throw error;
    }
};
