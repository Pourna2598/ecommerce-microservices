import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/CheckoutSteps";
import { clearCartItems } from "../store/slices/cartSlice";
import { createOrder } from "../store/slices/orderSlice";
import { AppDispatch, RootState } from "../store/store";

const ReviewPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { cartItems, shippingAddress } = useSelector(
        (state: RootState) => state.cart
    );

    useEffect(() => {
        if (!shippingAddress?.address) {
            navigate("/shipping");
        }
    }, [shippingAddress, navigate]);

    const itemsPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Number((itemsPrice * 0.15).toFixed(2));
    const totalPrice = Number(
        (itemsPrice + shippingPrice + taxPrice).toFixed(2)
    );

    const handlePlaceOrder = async () => {
        if (!shippingAddress) return;

        const order = {
            orderItems: cartItems,
            shippingAddress,
            paymentMethod: "Credit Card",
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
        };

        const result = (await dispatch(createOrder(order))) as {
            meta: { requestStatus: string };
            payload: { _id: string };
        };
        if (result.meta.requestStatus === "fulfilled") {
            navigate(`/order/${result.payload._id}`);
            dispatch(clearCartItems());
        }
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <CheckoutSteps step={3} />
                <Typography variant="h4" component="h1" gutterBottom>
                    Review Order
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Shipping
                                </Typography>
                                <Typography>
                                    {shippingAddress?.address},{" "}
                                    {shippingAddress?.city},{" "}
                                    {shippingAddress?.postalCode},{" "}
                                    {shippingAddress?.country}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card sx={{ mt: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Items
                                </Typography>
                                <List>
                                    {cartItems.map((item) => (
                                        <ListItem key={item.product}>
                                            <Grid container>
                                                <Grid item xs={4}>
                                                    <ListItemText
                                                        primary={item.name}
                                                        secondary={`Qty: ${item.qty}`}
                                                    />
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={6}
                                                    sx={{ textAlign: "right" }}
                                                >
                                                    <Typography>
                                                        ₹
                                                        {(
                                                            item.price *
                                                            item.qty
                                                        ).toFixed(2)}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    ))}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Summary
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemText primary="Items" />
                                        <Typography>
                                            ₹{itemsPrice.toFixed(2)}
                                        </Typography>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Shipping" />
                                        <Typography>
                                            ₹{shippingPrice.toFixed(2)}
                                        </Typography>
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Tax" />
                                        <Typography>
                                            ₹{taxPrice.toFixed(2)}
                                        </Typography>
                                    </ListItem>
                                    <Divider />
                                    <ListItem>
                                        <ListItemText primary="Total" />
                                        <Typography variant="h6">
                                            ₹{totalPrice.toFixed(2)}
                                        </Typography>
                                    </ListItem>
                                </List>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    onClick={handlePlaceOrder}
                                    disabled={
                                        cartItems.length === 0 ||
                                        !shippingAddress
                                    }
                                >
                                    Place Order
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default ReviewPage;
