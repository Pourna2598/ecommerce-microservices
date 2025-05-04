import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Remove as RemoveIcon,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    TextField,
    Typography,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/CheckoutSteps";
import {
    clearCartItems,
    removeFromCart,
    updateCartQuantity,
} from "../store/slices/cartSlice";
import { AppDispatch, RootState } from "../store/store";

const CartPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { cartItems, itemsPrice, taxPrice, shippingPrice, totalPrice } =
        useSelector((state: RootState) => state.cart);

    const { user } = useSelector((state: RootState) => state.auth);

    const handleRemoveFromCart = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const handleUpdateQuantity = (id: string, qty: number) => {
        dispatch(updateCartQuantity({ id, qty }));
    };

    const handleClearCart = () => {
        dispatch(clearCartItems());
    };

    const handleProceedToShipping = () => {
        if (user) {
            navigate("/shipping");
        } else {
            navigate("/login", { state: { from: { pathname: "/shipping" } } });
        }
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <CheckoutSteps step={1} />
                <Typography variant="h4" component="h1" gutterBottom>
                    Shopping Cart
                </Typography>

                {cartItems.length === 0 ? (
                    <Box my={4}>
                        <Alert severity="info">
                            Your cart is empty.{" "}
                            <RouterLink
                                to="/"
                                style={{ textDecoration: "none" }}
                            >
                                Go Back
                            </RouterLink>
                        </Alert>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {/* Cart Items */}
                        <Grid item xs={12} md={8}>
                            <Card>
                                <List>
                                    {cartItems.map((item) => (
                                        <React.Fragment key={item.product}>
                                            <ListItem
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    py: 2,
                                                }}
                                            >
                                                <Box flexGrow={1}>
                                                    <Typography
                                                        component={RouterLink}
                                                        to={`/product/${item.product}`}
                                                        variant="subtitle1"
                                                        sx={{
                                                            textDecoration:
                                                                "none",
                                                            color: "primary.main",
                                                        }}
                                                    >
                                                        {item.name}
                                                    </Typography>

                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        gutterBottom
                                                    >
                                                        ₹{item.price.toFixed(2)}
                                                    </Typography>

                                                    <Box
                                                        display="flex"
                                                        alignItems="center"
                                                        mt={1}
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleUpdateQuantity(
                                                                    item.product,
                                                                    Math.max(
                                                                        1,
                                                                        item.qty -
                                                                            1
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                item.qty <= 1
                                                            }
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>

                                                        <TextField
                                                            size="small"
                                                            inputProps={{
                                                                min: 1,
                                                                max: item.countInStock,
                                                                style: {
                                                                    textAlign:
                                                                        "center",
                                                                },
                                                            }}
                                                            value={item.qty}
                                                            onChange={(e) => {
                                                                const value =
                                                                    parseInt(
                                                                        e.target
                                                                            .value
                                                                    );
                                                                if (
                                                                    !isNaN(
                                                                        value
                                                                    ) &&
                                                                    value > 0 &&
                                                                    value <=
                                                                        item.countInStock
                                                                ) {
                                                                    handleUpdateQuantity(
                                                                        item.product,
                                                                        value
                                                                    );
                                                                }
                                                            }}
                                                            sx={{
                                                                width: 60,
                                                                mx: 1,
                                                            }}
                                                        />

                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleUpdateQuantity(
                                                                    item.product,
                                                                    Math.min(
                                                                        item.countInStock,
                                                                        item.qty +
                                                                            1
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                item.qty >=
                                                                item.countInStock
                                                            }
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Box>

                                                <Box>
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight="bold"
                                                    >
                                                        ₹
                                                        {(
                                                            item.price *
                                                            item.qty
                                                        ).toFixed(2)}
                                                    </Typography>
                                                    <IconButton
                                                        onClick={() =>
                                                            handleRemoveFromCart(
                                                                item.product
                                                            )
                                                        }
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            </ListItem>
                                            {item !==
                                                cartItems[
                                                    cartItems.length - 1
                                                ] && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Card>
                        </Grid>

                        {/* Order Summary */}
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Order Summary
                                    </Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemText
                                                primary="Items"
                                                secondary={`${cartItems.reduce(
                                                    (acc, item) =>
                                                        acc + item.qty,
                                                    0
                                                )} items`}
                                            />
                                            <Typography>
                                                ₹{itemsPrice.toFixed(2)}
                                            </Typography>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="Tax"
                                                secondary="10%"
                                            />
                                            <Typography>
                                                ₹{taxPrice.toFixed(2)}
                                            </Typography>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemText
                                                primary="Shipping"
                                                secondary={
                                                    itemsPrice > 100
                                                        ? "Free"
                                                        : "₹10.00"
                                                }
                                            />
                                            <Typography>
                                                ₹{shippingPrice.toFixed(2)}
                                            </Typography>
                                        </ListItem>
                                        <Divider />
                                        <ListItem>
                                            <ListItemText
                                                primary="Total"
                                                primaryTypographyProps={{
                                                    variant: "h6",
                                                }}
                                            />
                                            <Typography variant="h6">
                                                ₹{totalPrice.toFixed(2)}
                                            </Typography>
                                        </ListItem>
                                    </List>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        onClick={handleProceedToShipping}
                                        sx={{ mt: 2 }}
                                    >
                                        Proceed to Shipping
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default CartPage;
