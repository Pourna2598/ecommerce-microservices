import { Box, ThemeProvider, createTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";

// Layout Components
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import Navbar from "./components/layout/Navbar";

// Pages
import AdminOrderPage from "./pages/admin/AdminOrderPage";
import DashboardPage from "./pages/admin/DashboardPage";
import OrderListPage from "./pages/admin/OrderListPage";
import ProductEditPage from "./pages/admin/ProductEditPage";
import ProductListPage from "./pages/admin/ProductListPage";
import UserListPage from "./pages/admin/UserListPage";
import CartPage from "./pages/CartPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import NotFoundPage from "./pages/NotFoundPage";
import OrderPage from "./pages/OrderPage";
import PaymentPage from "./pages/PaymentPage";
import PlaceOrderPage from "./pages/PlaceOrderPage";
import ProductDetail from "./pages/ProductDetail";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import ReviewPage from "./pages/ReviewPage";
import ShippingPage from "./pages/ShippingPage";

// Routes
import AdminRoute from "./routes/AdminRoute";
import PrivateRoute from "./routes/PrivateRoute";

// Redux
import { getUserProfile, resetLoading } from "./store/slices/authSlice";
import { AppDispatch, RootState } from "./store/store";

// Theme
const theme = createTheme({
    palette: {
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#f50057",
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: "2.5rem",
            fontWeight: 500,
        },
        h2: {
            fontSize: "2rem",
            fontWeight: 500,
        },
        h3: {
            fontSize: "1.75rem",
            fontWeight: 500,
        },
    },
});

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Check if user is logged in
    const isLoggedIn = !!user;

    useEffect(() => {
        // Always reset loading state on app initialization
        dispatch(resetLoading());

        // Check if user is logged in by token in localStorage
        const userToken = localStorage.getItem("userToken");
        if (userToken) {
            dispatch(getUserProfile());
        }
    }, [dispatch]);

    // Handle drawer open/close
    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    return (
        <ThemeProvider theme={theme}>
            {/* <CssBaseline /> */}
            <Router>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "100vh",
                        width: "100%",
                    }}
                >
                    {isLoggedIn && (
                        <>
                            <Header onMenuOpen={handleDrawerOpen} />
                            <Navbar
                                isOpen={drawerOpen}
                                onClose={handleDrawerClose}
                            />
                        </>
                    )}

                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            width: "100%",
                            py: 2,
                            px: { xs: 1, sm: 2 },
                        }}
                    >
                        <Routes>
                            {/* Root path - Redirect based on user role */}
                            <Route
                                path="/"
                                element={
                                    isLoggedIn ? (
                                        user?.isAdmin ? (
                                            <Navigate to="/admin/dashboard" />
                                        ) : (
                                            <HomePage />
                                        )
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />

                            {/* Products page routes */}
                            <Route
                                path="/products"
                                element={<ProductsPage />}
                            />
                            <Route
                                path="/products/page/:pageNumber"
                                element={<ProductsPage />}
                            />
                            <Route
                                path="/products/search/:keyword"
                                element={<ProductsPage />}
                            />
                            <Route
                                path="/products/search/:keyword/page/:pageNumber"
                                element={<ProductsPage />}
                            />

                            {/* Existing routes */}
                            <Route
                                path="/search/:keyword"
                                element={<HomePage />}
                            />
                            <Route
                                path="/page/:pageNumber"
                                element={<HomePage />}
                            />
                            <Route
                                path="/search/:keyword/page/:pageNumber"
                                element={<HomePage />}
                            />
                            <Route
                                path="/product/:id"
                                element={<ProductDetail />}
                            />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/register"
                                element={<RegisterPage />}
                            />

                            {/* Private Routes */}
                            <Route
                                path="/profile"
                                element={
                                    <PrivateRoute>
                                        <ProfilePage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/shipping"
                                element={
                                    <PrivateRoute>
                                        <ShippingPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/review"
                                element={
                                    <PrivateRoute>
                                        <ReviewPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/payment"
                                element={
                                    <PrivateRoute>
                                        <PaymentPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/placeorder"
                                element={
                                    <PrivateRoute>
                                        <PlaceOrderPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/order/:id"
                                element={
                                    <PrivateRoute>
                                        <OrderPage />
                                    </PrivateRoute>
                                }
                            />
                            <Route
                                path="/my-orders"
                                element={
                                    <PrivateRoute>
                                        <MyOrdersPage />
                                    </PrivateRoute>
                                }
                            />

                            {/* Admin Routes */}
                            <Route
                                path="/admin/dashboard"
                                element={
                                    <AdminRoute>
                                        <DashboardPage />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="/admin/userlist"
                                element={
                                    <AdminRoute>
                                        <UserListPage />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="/admin/productlist"
                                element={
                                    <AdminRoute>
                                        <ProductListPage />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="/admin/productlist/:pageNumber"
                                element={
                                    <AdminRoute>
                                        <ProductListPage />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="/admin/product/:id/edit"
                                element={
                                    <AdminRoute>
                                        <ProductEditPage />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="/admin/product/new"
                                element={
                                    <AdminRoute>
                                        <ProductEditPage />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="/admin/orderlist"
                                element={
                                    <AdminRoute>
                                        <OrderListPage />
                                    </AdminRoute>
                                }
                            />
                            <Route
                                path="/admin/order/:id"
                                element={
                                    <AdminRoute>
                                        <AdminOrderPage />
                                    </AdminRoute>
                                }
                            />

                            {/* 404 Page */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Box>

                    {isLoggedIn && <Footer />}
                </Box>
            </Router>
        </ThemeProvider>
    );
};

export default App;
