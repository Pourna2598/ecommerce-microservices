import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Rating,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { addToCart } from "../store/slices/cartSlice";
import { fetchProductDetails } from "../store/slices/productSlice";
import { AppDispatch, RootState } from "../store/store";

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { product, loading, error } = useSelector(
        (state: RootState) => state.products
    );
    const [qty, setQty] = useState(1);

    useEffect(() => {
        if (id) {
            dispatch(fetchProductDetails(id));
        }
    }, [dispatch, id]);

    const addToCartHandler = () => {
        if (product) {
            dispatch(addToCart({ product, qty }));
            navigate("/cart");
        }
    };

    if (loading) return <Loader />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!product) return <Alert severity="info">Product not found</Alert>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Box
                            component="img"
                            src={product.image}
                            alt={product.name}
                            sx={{
                                width: "100%",
                                height: "auto",
                                objectFit: "cover",
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {product.name}
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 2,
                            }}
                        >
                            <Rating value={product.rating} readOnly />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                ({product.numReviews} reviews)
                            </Typography>
                        </Box>
                        <Typography variant="h5" color="primary" gutterBottom>
                            ₹{product.price}
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {product.description}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <TextField
                                type="number"
                                label="Quantity"
                                value={qty}
                                onChange={(e) => setQty(Number(e.target.value))}
                                inputProps={{
                                    min: 1,
                                    max: product.stockQuantity,
                                }}
                                sx={{ width: "100px" }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={addToCartHandler}
                                disabled={product.stockQuantity === 0}
                            >
                                Add to Cart
                            </Button>
                            <Typography
                                variant="body2"
                                color={
                                    product.stockQuantity > 0
                                        ? "success.main"
                                        : "error"
                                }
                                sx={{ mt: 1 }}
                            >
                                {product.stockQuantity > 0
                                    ? `${product.stockQuantity} in stock`
                                    : "Out of stock"}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default ProductDetail;
