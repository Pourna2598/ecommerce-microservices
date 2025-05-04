import {
    Box,
    Button,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../store/slices/orderSlice";
import { AppDispatch, RootState } from "../store/store";

const steps = ["Shipping", "Payment", "Review"];

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { cartItems } = useSelector((state: RootState) => state.cart);
    const [activeStep, setActiveStep] = useState(0);
    const [shippingInfo, setShippingInfo] = useState({
        address: "",
        city: "",
        postalCode: "",
        country: "",
    });
    const [paymentMethod, setPaymentMethod] = useState("PayPal");

    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            // Place order
            const orderData = {
                orderItems: cartItems,
                shippingAddress: shippingInfo,
                paymentMethod,
                itemsPrice: cartItems.reduce(
                    (acc, item) => acc + item.price * item.qty,
                    0
                ),
                shippingPrice: 10, // Fixed shipping price
                taxPrice: 0, // Calculate tax based on location
                totalPrice: 0, // Calculate total
            };
            dispatch(createOrder(orderData));
            navigate("/order-confirmation");
        } else {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Address"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleShippingChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="City"
                                name="city"
                                value={shippingInfo.city}
                                onChange={handleShippingChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Postal Code"
                                name="postalCode"
                                value={shippingInfo.postalCode}
                                onChange={handleShippingChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Country"
                                name="country"
                                value={shippingInfo.country}
                                onChange={handleShippingChange}
                            />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    value={paymentMethod}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                >
                                    <MenuItem value="PayPal">PayPal</MenuItem>
                                    <MenuItem value="Credit Card">
                                        Credit Card
                                    </MenuItem>
                                    <MenuItem value="Stripe">Stripe</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Order Summary
                            </Typography>
                            {cartItems.map((item) => (
                                <Box key={item.product} sx={{ mb: 2 }}>
                                    <Typography>
                                        {item.name} x {item.qty} - ₹
                                        {(item.price * item.qty).toFixed(2)}
                                    </Typography>
                                </Box>
                            ))}
                            <Typography variant="h6" gutterBottom>
                                Shipping: ₹10.0
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Total: ₹
                                {(
                                    cartItems.reduce(
                                        (acc, item) =>
                                            acc + item.price * item.qty,
                                        0
                                    ) + 10
                                ).toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                );
            default:
                return "Unknown step";
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Checkout
                </Typography>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <Paper sx={{ p: 3 }}>
                    {getStepContent(activeStep)}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 3,
                        }}
                    >
                        {activeStep !== 0 && (
                            <Button onClick={handleBack} sx={{ mr: 1 }}>
                                Back
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                        >
                            {activeStep === steps.length - 1
                                ? "Place Order"
                                : "Next"}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Checkout;
