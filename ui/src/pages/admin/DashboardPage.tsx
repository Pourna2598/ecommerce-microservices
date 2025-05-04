import {
    AccessTime as AccessTimeIcon,
    Inventory as InventoryIcon,
    People as PeopleIcon,
    Refresh as RefreshIcon,
    ShoppingCart as ShoppingCartIcon,
    TrendingUp as TrendingUpIcon,
    Warning as WarningIcon,
} from "@mui/icons-material";
import {
    Box,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import {
    fetchDashboardStats,
    fetchHealthStatus,
} from "../../store/slices/adminSlice";
import { AppDispatch, RootState } from "../../store/store";

const DashboardPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { stats, loading, error, health, healthLoading, healthError } =
        useSelector((state: RootState) => state.admin);
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    if (loading) return <Loader />;
    if (error) return <Typography color="error">{error}</Typography>;

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    gutterBottom
                >
                    Overview of your e-commerce platform
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {/* Key Metrics Section */}
                    <Grid item xs={12} md={3}>
                        <Paper
                            sx={{
                                p: 3,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                height: "100%",
                            }}
                        >
                            <TrendingUpIcon
                                color="primary"
                                sx={{ fontSize: 40, mb: 1 }}
                            />
                            <Typography variant="h6" gutterBottom>
                                Total Sales
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {formatCurrency(stats?.totalSales || 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                All-time revenue
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Paper
                            sx={{
                                p: 3,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                height: "100%",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/admin/userlist")}
                        >
                            <PeopleIcon
                                color="primary"
                                sx={{ fontSize: 40, mb: 1 }}
                            />
                            <Typography variant="h6" gutterBottom>
                                Total Users
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {stats?.userStats?.totalUsers || 0}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Chip
                                    label={`${
                                        stats?.userStats?.totalAdmins || 0
                                    } Admins`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`${
                                        stats?.userStats?.totalCustomers || 0
                                    } Customers`}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                />
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Paper
                            sx={{
                                p: 3,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                height: "100%",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/admin/productlist")}
                        >
                            <InventoryIcon
                                color="primary"
                                sx={{ fontSize: 40, mb: 1 }}
                            />
                            <Typography variant="h6" gutterBottom>
                                Total Products
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {stats?.totalProducts || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active products
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <Paper
                            sx={{
                                p: 3,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                height: "100%",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/admin/orderlist")}
                        >
                            <ShoppingCartIcon
                                color="primary"
                                sx={{ fontSize: 40, mb: 1 }}
                            />
                            <Typography variant="h6" gutterBottom>
                                Total Orders
                            </Typography>
                            <Typography variant="h4" color="primary">
                                {Object.values(stats?.orderStats || {}).reduce(
                                    (a, b) => a + b,
                                    0
                                )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                All-time orders
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Order Status Section */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            sx={{
                                p: 3,
                                height: "100%",
                                cursor: "pointer",
                            }}
                            onClick={() => navigate("/admin/orderlist")}
                        >
                            <Typography variant="h6" gutterBottom>
                                Order Status Distribution
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={1}>
                                {stats?.orderStats && (
                                    <>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Chip
                                                label="Pending"
                                                color="warning"
                                                size="small"
                                            />
                                            <Typography variant="body1">
                                                {stats.orderStats.pending}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Chip
                                                label="Processing"
                                                color="info"
                                                size="small"
                                            />
                                            <Typography variant="body1">
                                                {stats.orderStats.processing}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Chip
                                                label="Shipped"
                                                color="success"
                                                size="small"
                                            />
                                            <Typography variant="body1">
                                                {stats.orderStats.shipped}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Chip
                                                label="Delivered"
                                                color="success"
                                                size="small"
                                            />
                                            <Typography variant="body1">
                                                {stats.orderStats.delivered}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Chip
                                                label="Cancelled"
                                                color="error"
                                                size="small"
                                            />
                                            <Typography variant="body1">
                                                {stats.orderStats.cancelled}
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Service Health Section */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: "100%" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 2,
                                }}
                            >
                                <Typography variant="h6">
                                    Service Health Status
                                </Typography>
                                <Tooltip title="Refresh health status">
                                    <IconButton
                                        onClick={() =>
                                            dispatch(fetchHealthStatus())
                                        }
                                        disabled={healthLoading}
                                        size="small"
                                    >
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {healthLoading ? (
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        p: 3,
                                    }}
                                >
                                    <CircularProgress size={24} />
                                </Box>
                            ) : healthError ? (
                                <Typography color="error">
                                    {healthError}
                                </Typography>
                            ) : (
                                <Stack spacing={1}>
                                    {health?.services.map((service) => (
                                        <Box
                                            key={service.service}
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                <Typography variant="body1">
                                                    {service.service.toUpperCase()}{" "}
                                                    Service
                                                </Typography>
                                                {service.responseTime && (
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        ({service.responseTime}
                                                        ms)
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Chip
                                                label={service.status.toUpperCase()}
                                                color={
                                                    service.status === "healthy"
                                                        ? "success"
                                                        : "error"
                                                }
                                                size="small"
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Paper>
                    </Grid>

                    {/* Low Stock Products Section */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: "100%" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 2,
                                }}
                            >
                                <Typography variant="h6">
                                    Low Stock Products
                                </Typography>
                                <Tooltip title="Products with low inventory">
                                    <IconButton size="small">
                                        <WarningIcon color="warning" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                {stats?.lowStockProducts?.map((product) => (
                                    <Paper
                                        key={product._id}
                                        variant="outlined"
                                        sx={{ p: 2, cursor: "pointer" }}
                                        onClick={() =>
                                            navigate(
                                                `/admin/product/${product._id}/edit`
                                            )
                                        }
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 1,
                                            }}
                                        >
                                            <Typography variant="subtitle2">
                                                {product.name}
                                            </Typography>
                                            <Chip
                                                label={`Stock: ${product.stockQuantity}`}
                                                color={
                                                    product.stockQuantity <= 5
                                                        ? "error"
                                                        : "warning"
                                                }
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="body2">
                                            Price:{" "}
                                            {formatCurrency(product.price)}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Recent Orders Section */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: "100%" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 2,
                                }}
                            >
                                <Typography variant="h6">
                                    Recent Orders
                                </Typography>
                                <Tooltip title="Last 5 orders">
                                    <IconButton size="small">
                                        <AccessTimeIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                {stats?.recentOrders?.map((order) => (
                                    <Paper
                                        key={order._id}
                                        variant="outlined"
                                        sx={{ p: 2, cursor: "pointer" }}
                                        onClick={() =>
                                            navigate(
                                                `/admin/order/${order._id}`
                                            )
                                        }
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                mb: 1,
                                            }}
                                        >
                                            <Typography variant="subtitle2">
                                                Order #{order._id.slice(-6)}
                                            </Typography>
                                            <Chip
                                                label={order.status.toUpperCase()}
                                                color={getStatusColor(
                                                    order.status
                                                )}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            User ID: {order.userId}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            User Email: {order.userEmail}
                                        </Typography>
                                        <Typography variant="body2">
                                            Amount:{" "}
                                            {formatCurrency(order.totalPrice)}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {formatDate(order.createdAt)}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default DashboardPage;
