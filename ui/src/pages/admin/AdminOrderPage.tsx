import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Paper,
    Select,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
    getOrderDetails,
    updateOrderStatus,
} from "../../store/slices/orderSlice";
import {
    clearOrderUser,
    fetchOrderUser,
} from "../../store/slices/orderUserSlice";
import { AppDispatch, RootState } from "../../store/store";

const AdminOrderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const {
        order,
        loading: orderLoading,
        error: orderError,
    } = useSelector((state: RootState) => state.orders);
    const orderUser = useSelector((state: RootState) => state.orderUser);

    const [status, setStatus] = useState("");
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Initial load of order and user data
    useEffect(() => {
        if (id && isInitialLoad) {
            dispatch(getOrderDetails(id));
            setIsInitialLoad(false);
        }
    }, [dispatch, id, isInitialLoad]);

    // Load user details after order is loaded
    useEffect(() => {
        if (order?.user) {
            dispatch(fetchOrderUser(order.user));
        } else {
            dispatch(clearOrderUser());
        }
    }, [dispatch, order?.user]);

    // Update status when order changes
    useEffect(() => {
        if (order) {
            setStatus(order.status);
        }
    }, [order]);

    const handleOpenStatusDialog = () => {
        setOpenStatusDialog(true);
    };

    const handleCloseStatusDialog = () => {
        setOpenStatusDialog(false);
    };

    const handleStatusChange = (e: any) => {
        setStatus(e.target.value);
    };

    const handleUpdateStatus = () => {
        if (id && status) {
            dispatch(updateOrderStatus({ id, status }));
            handleCloseStatusDialog();
        }
    };

    if (orderLoading || orderUser.loading) return <Loader />;
    if (orderError) return <Message severity="error">{orderError}</Message>;
    if (orderUser.error)
        return <Message severity="error">{orderUser.error}</Message>;
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
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography variant="h4" component="h1">
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenStatusDialog}
                        disabled={
                            order.status === "cancelled" ||
                            order.status === "delivered"
                        }
                    >
                        Update Status
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                User Details
                            </Typography>
                            <Typography>
                                <strong>Name:</strong>{" "}
                                {orderUser.user?.name || "N/A"}
                            </Typography>
                            <Typography>
                                <strong>Email:</strong>{" "}
                                {orderUser.user?.email || "N/A"}
                            </Typography>
                        </Paper>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Shipping
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
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Status Update Dialog */}
            <Dialog
                open={openStatusDialog}
                onClose={handleCloseStatusDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Select
                            fullWidth
                            value={status}
                            onChange={handleStatusChange}
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="processing">Processing</MenuItem>
                            <MenuItem value="shipped">Shipped</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStatusDialog}>Cancel</Button>
                    <Button onClick={handleUpdateStatus} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminOrderPage;
