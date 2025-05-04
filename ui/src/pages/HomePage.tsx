import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Paper,
    Typography,
    useTheme,
} from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";
import ProductCard from "../components/product/ProductCard";
import { fetchTopProducts } from "../store/slices/productSlice";
import { AppDispatch, RootState } from "../store/store";

const HomePage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const theme = useTheme();

    const { topProducts, loading, error } = useSelector(
        (state: RootState) => state.products
    );

    useEffect(() => {
        dispatch(fetchTopProducts());
    }, [dispatch]);

    return (
        <Box width="100%">
            {/* Hero Banner */}
            <Paper
                sx={{
                    position: "relative",
                    color: "#fff",
                    mb: 4,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80)`,
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        p: { xs: 3, md: 6 },
                        textAlign: "center",
                        maxWidth: "800px",
                    }}
                >
                    <Typography
                        component="h1"
                        variant="h3"
                        color="inherit"
                        gutterBottom
                    >
                        Welcome to Our Store
                    </Typography>
                    <Typography variant="h5" color="inherit" paragraph>
                        Discover amazing products at competitive prices
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        color="primary"
                        onClick={() => navigate("/products")}
                        sx={{ mt: 2 }}
                    >
                        Shop Now
                    </Button>
                </Box>
            </Paper>

            {/* Featured Categories */}
            <Box sx={{ mb: 5 }}>
                <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    align="center"
                    sx={{ mb: 3 }}
                >
                    Shop by Category
                </Typography>

                <Grid container spacing={3}>
                    {["Electronics", "Clothing", "Home & Kitchen", "Books"].map(
                        (category) => (
                            <Grid item xs={12} sm={6} md={3} key={category}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        transition: "transform 0.3s",
                                        "&:hover": {
                                            transform: "scale(1.03)",
                                            boxShadow: theme.shadows[6],
                                        },
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        navigate(
                                            `/products?category=${category}`
                                        )
                                    }
                                >
                                    <Box
                                        sx={{
                                            height: 140,
                                            bgcolor: "primary.main",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                        }}
                                    >
                                        <Typography variant="h5">
                                            {category}
                                        </Typography>
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Explore our {category.toLowerCase()}{" "}
                                            collection with the latest trends
                                            and best deals.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    )}
                </Grid>
            </Box>

            {/* Top Products */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <Typography variant="h4" component="h2">
                        Featured Products
                    </Typography>
                    <Button variant="outlined" component={Link} to="/products">
                        View All
                    </Button>
                </Box>

                {loading ? (
                    <Loader />
                ) : error ? (
                    <Message severity="error">{error}</Message>
                ) : (
                    <Grid container spacing={3}>
                        {topProducts &&
                            topProducts.slice(0, 4).map((product) => (
                                <Grid
                                    item
                                    key={product._id}
                                    xs={12}
                                    sm={6}
                                    md={3}
                                >
                                    <ProductCard product={product} />
                                </Grid>
                            ))}
                    </Grid>
                )}
            </Box>

            {/* Special Offers */}
            <Paper
                sx={{
                    p: 4,
                    mb: 4,
                    position: "relative",
                    color: "white",
                    borderRadius: 2,
                    overflow: "hidden",
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                            "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))",
                        zIndex: 1,
                    },
                }}
            >
                <Box sx={{ position: "relative", zIndex: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        Special Payment Offers
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    borderRadius: 1,
                                    backdropFilter: "blur(5px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    transition: "transform 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        backgroundColor:
                                            "rgba(255,255,255,0.15)",
                                    },
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    HDFC Bank
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Get 10% cashback on HDFC credit cards
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ display: "block", mb: 1 }}
                                >
                                    Min. purchase: ₹2000
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    borderRadius: 1,
                                    backdropFilter: "blur(5px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    transition: "transform 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        backgroundColor:
                                            "rgba(255,255,255,0.15)",
                                    },
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    SBI Card
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Flat 15% off on SBI credit cards
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ display: "block", mb: 1 }}
                                >
                                    Max. discount: ₹1500
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    borderRadius: 1,
                                    backdropFilter: "blur(5px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    transition: "transform 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        backgroundColor:
                                            "rgba(255,255,255,0.15)",
                                    },
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    UPI
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    5% instant discount on UPI payments
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ display: "block", mb: 1 }}
                                >
                                    Valid on all UPI apps
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    borderRadius: 1,
                                    backdropFilter: "blur(5px)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    transition: "transform 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        backgroundColor:
                                            "rgba(255,255,255,0.15)",
                                    },
                                }}
                            >
                                <Typography variant="h6" gutterBottom>
                                    EMI Options
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    No-cost EMI available
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ display: "block", mb: 1 }}
                                >
                                    On orders above ₹5000
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default HomePage;
