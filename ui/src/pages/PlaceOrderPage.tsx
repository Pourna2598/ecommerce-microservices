import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/CheckoutSteps";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { clearCartItems } from "../store/slices/cartSlice";
import { createOrder, resetOrder } from "../store/slices/orderSlice";
import { AppDispatch, RootState } from "../store/store";

const PlaceOrderPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { cartItems, shippingAddress, paymentMethod } = useSelector(
        (state: RootState) => state.cart
    );
    const { order, loading, error } = useSelector(
        (state: RootState) => state.orders
    );

    // Clear any existing order data when component mounts
    useEffect(() => {
        dispatch(resetOrder());
    }, [dispatch]);

    useEffect(() => {
        if (!shippingAddress?.address) {
            navigate("/shipping");
        } else if (!paymentMethod) {
            navigate("/payment");
        }
    }, [navigate, shippingAddress, paymentMethod]);

    useEffect(() => {
        if (order?._id) {
            dispatch(clearCartItems());
            navigate(`/order/${order._id}`);
        }
    }, [navigate, order, dispatch]);

    const placeOrderHandler = () => {
        if (shippingAddress && paymentMethod) {
            dispatch(
                createOrder({
                    orderItems: cartItems,
                    shippingAddress,
                    paymentMethod,
                    itemsPrice: cartItems.reduce(
                        (acc, item) => acc + item.price * item.qty,
                        0
                    ),
                    shippingPrice: 0,
                    taxPrice: 0,
                    totalPrice: cartItems.reduce(
                        (acc, item) => acc + item.price * item.qty,
                        0
                    ),
                })
            );
        }
    };

    if (loading) return <Loader />;

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <CheckoutSteps step={3} />

                {error && (
                    <Box mb={3}>
                        <Message severity="error">{error}</Message>
                    </Box>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Shipping
                            </Typography>
                            <Typography>
                                <strong>Address:</strong>{" "}
                                {shippingAddress?.address},{" "}
                                {shippingAddress?.city},{" "}
                                {shippingAddress?.postalCode},{" "}
                                {shippingAddress?.country}
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Payment Method
                            </Typography>
                            <Typography>
                                <strong>Method:</strong> {paymentMethod}
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Order Items
                            </Typography>
                            {cartItems.map((item) => (
                                <Box
                                    key={item.product}
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
                                    <strong>Items:</strong> ₹
                                    {cartItems
                                        .reduce(
                                            (acc, item) =>
                                                acc + item.price * item.qty,
                                            0
                                        )
                                        .toFixed(2)}
                                </Typography>
                                <Typography>
                                    <strong>Shipping:</strong> ₹0.00
                                </Typography>
                                <Typography>
                                    <strong>Tax:</strong> ₹0.00
                                </Typography>
                                <Typography variant="h6" sx={{ mt: 2 }}>
                                    <strong>Total:</strong> ₹
                                    {cartItems
                                        .reduce(
                                            (acc, item) =>
                                                acc + item.price * item.qty,
                                            0
                                        )
                                        .toFixed(2)}
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={placeOrderHandler}
                                disabled={cartItems.length === 0}
                            >
                                Place Order
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default PlaceOrderPage;
