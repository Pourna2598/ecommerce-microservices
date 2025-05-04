import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { processPayment as processPaymentApi } from "../services/paymentService";
import { getOrderDetails } from "../store/slices/orderSlice";
import { AppDispatch, RootState } from "../store/store";

const OrderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { order, loading, error, success } = useSelector(
        (state: RootState) => state.orders
    );
    const { user } = useSelector((state: RootState) => state.auth);

    // Payment modal state
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [paymentStep, setPaymentStep] = useState<"card" | "otp">("card");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
        "Credit Card" | "Debit Card"
    >("Credit Card");
    const [cardDetails, setCardDetails] = useState({
        cardNumber: "",
        cardName: "",
        expDate: "",
        cvv: "",
    });
    const [otp, setOtp] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(getOrderDetails(id));
        }
    }, [dispatch, id, success]);

    const handleOpenPaymentModal = () => {
        setOpenPaymentModal(true);
        setPaymentError("");
        setPaymentSuccess(false);
    };

    const handleClosePaymentModal = () => {
        setOpenPaymentModal(false);
    };

    const validateForm = () => {
        if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 16) {
            setPaymentError("Please enter a valid card number");
            return false;
        }
        if (!cardDetails.cardName) {
            setPaymentError("Please enter the cardholder name");
            return false;
        }
        if (!cardDetails.expDate || !cardDetails.expDate.includes("/")) {
            setPaymentError("Please enter a valid expiration date (MM/YY)");
            return false;
        }
        if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
            setPaymentError("Please enter a valid CVV");
            return false;
        }
        if (!otp || otp.length < 4) {
            setPaymentError("Please enter a valid OTP");
            return false;
        }
        return true;
    };

    const handleCardDetailsSubmit = async () => {
        setPaymentLoading(true);
        setPaymentError("");

        // Validate card number format
        if (!/^\d{16}$/.test(cardDetails.cardNumber)) {
            setPaymentError("Please enter a valid 16-digit card number");
            setPaymentLoading(false);
            return;
        }

        // Validate expiration date format
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expDate)) {
            setPaymentError("Please enter a valid expiration date (MM/YY)");
            setPaymentLoading(false);
            return;
        }

        // Validate CVV format
        if (!/^\d{3}$/.test(cardDetails.cvv)) {
            setPaymentError("Please enter a valid 3-digit CVV");
            setPaymentLoading(false);
            return;
        }

        // Simulate API call to validate card
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setPaymentStep("otp");
        setPaymentLoading(false);
    };

    const handleOtpSubmit = async () => {
        if (!validateForm() || !order || !id) return;

        setPaymentLoading(true);
        setPaymentError("");

        try {
            // Simulate payment processing
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const response = await processPaymentApi({
                orderId: id,
                amount: order.totalPrice,
                paymentMethod: order.paymentMethod,
                cardDetails: {
                    ...cardDetails,
                    otp,
                },
            });

            if (response && response.success) {
                setPaymentSuccess(true);
                setTimeout(() => {
                    dispatch(getOrderDetails(id));
                    setOpenPaymentModal(false);
                }, 2000);
            }
        } catch (error: any) {
            setPaymentError(
                error.response?.data?.message ||
                    "Failed to process payment. Please try again."
            );
        } finally {
            setPaymentLoading(false);
        }
    };

    if (loading) return <Loader />;
    if (error) return <Message severity="error">{error}</Message>;
    if (!order) return <Message severity="error">Order not found</Message>;
    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "warning";
            case "processing":
                return "info";
            case "shipped":
                return "success";
            case "delivered":
                return "success";
            case "cancelled":
                return "error";
            default:
                return "default";
        }
    };
    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Order {order._id}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="h6" component="h2">
                        Status:{" "}
                    </Typography>
                    <Typography
                        variant="h6"
                        component="h2"
                        color={getStatusColor(order.status)}
                    >
                        {order.status.toUpperCase()}
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Shipping
                            </Typography>
                            <Typography>
                                <strong>Name:</strong> {user?.name}
                            </Typography>
                            <Typography>
                                <strong>Email:</strong> {user?.email}
                            </Typography>
                            <Typography>
                                <strong>Address:</strong>{" "}
                                {order.shippingAddress.address},{" "}
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.postalCode},{" "}
                                {order.shippingAddress.country}
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Payment Method
                            </Typography>
                            <Typography>
                                <strong>Method:</strong> {order.paymentMethod}
                            </Typography>
                            <Typography>
                                <strong>Status:</strong>{" "}
                                {order.isPaid ? (
                                    <Typography
                                        component="span"
                                        color="success.main"
                                    >
                                        Paid on{" "}
                                        {order.paidAt
                                            ? new Date(
                                                  order.paidAt
                                              ).toLocaleDateString()
                                            : "Unknown date"}
                                    </Typography>
                                ) : (
                                    <Typography
                                        component="span"
                                        color="error.main"
                                    >
                                        Not Paid
                                    </Typography>
                                )}
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Order Items
                            </Typography>
                            {order.orderItems.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        mb: 2,
                                    }}
                                >
                                    <Box>
                                        <Typography>{item.name}</Typography>
                                        <Typography>
                                            {item.qty} x ₹{item.price} = ₹
                                            {(item.qty * item.price).toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Order Summary
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography>
                                    <strong>Items:</strong> ₹{order.itemsPrice}
                                </Typography>
                                <Typography>
                                    <strong>Shipping:</strong> ₹
                                    {order.shippingPrice}
                                </Typography>
                                <Typography>
                                    <strong>Tax:</strong> ₹{order.taxPrice}
                                </Typography>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    <strong>Total:</strong> ₹{order.totalPrice}
                                </Typography>
                            </Box>
                            {!order.isPaid && order.status !== "cancelled" && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleOpenPaymentModal}
                                >
                                    Pay Now
                                </Button>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Payment Modal */}
            <Dialog
                open={openPaymentModal}
                onClose={handleClosePaymentModal}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {paymentSuccess
                        ? "Payment Successful!"
                        : paymentStep === "card"
                        ? "Enter Payment Details"
                        : "Verify Payment"}
                </DialogTitle>
                <DialogContent>
                    {paymentSuccess ? (
                        <Typography color="success.main">
                            Your payment has been processed successfully. Thank
                            you for your order!
                        </Typography>
                    ) : (
                        <>
                            {paymentError && (
                                <Box mb={2}>
                                    <Message severity="error">
                                        {paymentError}
                                    </Message>
                                </Box>
                            )}
                            {paymentStep === "card" ? (
                                <>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        gutterBottom
                                    >
                                        Please select your payment method and
                                        enter card details.
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                <InputLabel>
                                                    Payment Method
                                                </InputLabel>
                                                <Select
                                                    value={
                                                        selectedPaymentMethod
                                                    }
                                                    onChange={(e) =>
                                                        setSelectedPaymentMethod(
                                                            e.target.value as
                                                                | "Credit Card"
                                                                | "Debit Card"
                                                        )
                                                    }
                                                    label="Payment Method"
                                                >
                                                    <MenuItem value="Credit Card">
                                                        Credit Card
                                                    </MenuItem>
                                                    <MenuItem value="Debit Card">
                                                        Debit Card
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Card Number"
                                                fullWidth
                                                value={cardDetails.cardNumber}
                                                onChange={(e) =>
                                                    setCardDetails((prev) => ({
                                                        ...prev,
                                                        cardNumber:
                                                            e.target.value
                                                                .replace(
                                                                    /\D/g,
                                                                    ""
                                                                )
                                                                .slice(0, 16),
                                                    }))
                                                }
                                                placeholder="1234 5678 9012 3456"
                                                inputProps={{ maxLength: 16 }}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Cardholder Name"
                                                fullWidth
                                                value={cardDetails.cardName}
                                                onChange={(e) =>
                                                    setCardDetails((prev) => ({
                                                        ...prev,
                                                        cardName:
                                                            e.target.value,
                                                    }))
                                                }
                                                placeholder="John Doe"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="Expiration Date"
                                                fullWidth
                                                value={cardDetails.expDate}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (
                                                        val.length === 2 &&
                                                        !val.includes("/") &&
                                                        cardDetails.expDate
                                                            .length === 1
                                                    ) {
                                                        setCardDetails(
                                                            (prev) => ({
                                                                ...prev,
                                                                expDate:
                                                                    val + "/",
                                                            })
                                                        );
                                                    } else {
                                                        setCardDetails(
                                                            (prev) => ({
                                                                ...prev,
                                                                expDate: val,
                                                            })
                                                        );
                                                    }
                                                }}
                                                placeholder="MM/YY"
                                                inputProps={{ maxLength: 5 }}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="CVV"
                                                fullWidth
                                                value={cardDetails.cvv}
                                                onChange={(e) =>
                                                    setCardDetails((prev) => ({
                                                        ...prev,
                                                        cvv: e.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 3),
                                                    }))
                                                }
                                                placeholder="123"
                                                inputProps={{ maxLength: 3 }}
                                            />
                                        </Grid>
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        gutterBottom
                                    >
                                        Please enter the OTP sent to your
                                        registered mobile number.
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="OTP"
                                                fullWidth
                                                value={otp}
                                                onChange={(e) =>
                                                    setOtp(
                                                        e.target.value
                                                            .replace(/\D/g, "")
                                                            .slice(0, 6)
                                                    )
                                                }
                                                placeholder="123456"
                                                inputProps={{ maxLength: 6 }}
                                            />
                                        </Grid>
                                    </Grid>
                                </>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {!paymentSuccess && (
                        <>
                            {paymentStep === "otp" ? (
                                <Button
                                    onClick={() => setPaymentStep("card")}
                                    color="inherit"
                                >
                                    Back
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleClosePaymentModal}
                                    color="inherit"
                                >
                                    Cancel
                                </Button>
                            )}
                            {paymentStep === "card" ? (
                                <Button
                                    onClick={handleCardDetailsSubmit}
                                    color="primary"
                                    variant="contained"
                                    disabled={paymentLoading}
                                >
                                    {paymentLoading
                                        ? "Validating..."
                                        : "Continue"}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleOtpSubmit}
                                    color="primary"
                                    variant="contained"
                                    disabled={paymentLoading || !otp}
                                >
                                    {paymentLoading
                                        ? "Processing..."
                                        : `Pay ₹${order.totalPrice}`}
                                </Button>
                            )}
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default OrderPage;
