import {
    Box,
    Button,
    Chip,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CancelOrder from "../components/CancelOrder";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { cancelOrder, listMyOrders } from "../store/slices/orderSlice";
import { AppDispatch, RootState } from "../store/store";

const MyOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { orders, loading, error } = useSelector(
        (state: RootState) => state.orders
    );
    const [openCancelDialog, setOpenCancelDialog] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(listMyOrders());
    }, [dispatch]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "processing":
                return "warning";
            case "shipped":
                return "info";
            case "delivered":
                return "success";
            case "cancelled":
                return "error";
            default:
                return "default";
        }
    };

    const handleViewOrder = (id: string) => {
        navigate(`/order/${id}`);
    };

    const handleOpenCancelDialog = (id: string) => {
        setSelectedOrderId(id);
        setOpenCancelDialog(true);
    };

    const handleCloseCancelDialog = () => {
        setOpenCancelDialog(false);
        setSelectedOrderId(null);
    };

    const handleCancelOrder = (reason: string) => {
        if (selectedOrderId) {
            dispatch(cancelOrder({ id: selectedOrderId, reason }));
        }
    };

    if (loading) return <Loader />;
    if (error) return <Message severity="error">{error}</Message>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    My Orders
                </Typography>

                {orders && orders.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: "center" }}>
                        <Typography variant="h6">
                            You haven't placed any orders yet.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => navigate("/")}
                        >
                            Start Shopping
                        </Button>
                    </Paper>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>DATE</TableCell>
                                    <TableCell>TOTAL</TableCell>
                                    <TableCell>PAID</TableCell>
                                    <TableCell>STATUS</TableCell>
                                    <TableCell>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell>{order._id}</TableCell>
                                        <TableCell>
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            ₹{order.totalPrice.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            {order.isPaid ? (
                                                <Chip
                                                    label="Paid"
                                                    color="success"
                                                    size="small"
                                                />
                                            ) : (
                                                <Chip
                                                    label="Not Paid"
                                                    color="error"
                                                    size="small"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status.toUpperCase()}
                                                color={getStatusColor(
                                                    order.status
                                                )}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell
                                            sx={{ display: "flex", gap: 1 }}
                                        >
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() =>
                                                    handleViewOrder(order._id)
                                                }
                                            >
                                                Details
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                disabled={
                                                    order.status ===
                                                        "delivered" ||
                                                    order.status ===
                                                        "cancelled" ||
                                                    order.isPaid
                                                }
                                                onClick={() =>
                                                    handleOpenCancelDialog(
                                                        order._id
                                                    )
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
            <CancelOrder
                open={openCancelDialog}
                onClose={handleCloseCancelDialog}
                onCancel={handleCancelOrder}
            />
        </Container>
    );
};

export default MyOrdersPage;
