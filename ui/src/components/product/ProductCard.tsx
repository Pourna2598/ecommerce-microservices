import { Add, AddShoppingCart, Remove } from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import {
    addToCart,
    removeFromCart,
    updateCartQuantity,
} from "../../store/slices/cartSlice";
import { AppDispatch, RootState } from "../../store/store";
import { Product } from "../../types";

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { cartItems } = useSelector((state: RootState) => state.cart);
    const [inCart, setInCart] = useState(false);
    const [quantity, setQuantity] = useState(0);

    // Use stockQuantity, fallback to countInStock for backward compatibility
    const availableStock = product.stockQuantity || product.countInStock || 0;

    // Check if the product is already in the cart
    useEffect(() => {
        const cartItem = cartItems.find((item) => item.product === product._id);
        if (cartItem) {
            setInCart(true);
            setQuantity(cartItem.qty);
        } else {
            setInCart(false);
            setQuantity(0);
        }
    }, [cartItems, product._id]);

    const handleAddToCart = () => {
        dispatch(addToCart({ product, qty: 1 }));
    };

    const handleIncreaseQuantity = () => {
        if (quantity < availableStock) {
            const newQty = quantity + 1;
            setQuantity(newQty);
            dispatch(updateCartQuantity({ id: product._id, qty: newQty }));
        }
    };

    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            const newQty = quantity - 1;
            setQuantity(newQty);
            dispatch(updateCartQuantity({ id: product._id, qty: newQty }));
        } else {
            // Remove from cart if quantity becomes 0
            dispatch(removeFromCart(product._id));
            setInCart(false);
        }
    };

    return (
        <Card
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 3,
                },
            }}
        >
            <CardActionArea
                component={RouterLink}
                to={`/product/${product._id}`}
                sx={{ flexGrow: 1 }}
            >
                <CardContent>
                    <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                            height: 60,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {product.name}
                    </Typography>

                    <Stack direction="row" spacing={1} mb={1}>
                        {product.categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                        {availableStock === 0 && (
                            <Chip
                                label="Out of Stock"
                                size="small"
                                color="error"
                            />
                        )}
                    </Stack>

                    <Typography variant="h6" color="primary" fontWeight="bold">
                        ₹{product.price.toFixed(2)}
                    </Typography>
                </CardContent>
            </CardActionArea>

            <Box p={2} pt={0}>
                {!inCart ? (
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<AddShoppingCart />}
                        onClick={handleAddToCart}
                        disabled={availableStock === 0}
                    >
                        Add to Cart
                    </Button>
                ) : (
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <IconButton
                            color="primary"
                            onClick={handleDecreaseQuantity}
                            size="small"
                        >
                            <Remove />
                        </IconButton>
                        <Typography variant="body1" fontWeight="bold">
                            {quantity}
                        </Typography>
                        <IconButton
                            color="primary"
                            onClick={handleIncreaseQuantity}
                            size="small"
                            disabled={quantity >= availableStock}
                        >
                            <Add />
                        </IconButton>
                    </Stack>
                )}
            </Box>
        </Card>
    );
};

export default ProductCard;
