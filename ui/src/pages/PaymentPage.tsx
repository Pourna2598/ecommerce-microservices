import {
    Box,
    Button,
    Container,
    FormControl,
    FormControlLabel,
    FormLabel,
    Paper,
    Radio,
    RadioGroup,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CheckoutSteps from "../components/CheckoutSteps";
import { savePaymentMethod } from "../store/slices/cartSlice";
import { AppDispatch, RootState } from "../store/store";

const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { shippingAddress } = useSelector((state: RootState) => state.cart);
    const [paymentMethod, setPaymentMethod] = useState("PayPal");

    if (!shippingAddress?.address) {
        navigate("/shipping");
        return null;
    }

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(savePaymentMethod(paymentMethod));
        navigate("/placeorder");
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <CheckoutSteps step={2} />
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Payment Method
                    </Typography>
                    <form onSubmit={submitHandler}>
                        <FormControl
                            component="fieldset"
                            sx={{ width: "100%" }}
                        >
                            <FormLabel component="legend">
                                Select Method
                            </FormLabel>
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                            >
                                <FormControlLabel
                                    value="PayPal"
                                    control={<Radio />}
                                    label="PayPal or Credit Card"
                                />
                                <FormControlLabel
                                    value="Stripe"
                                    control={<Radio />}
                                    label="Stripe"
                                />
                            </RadioGroup>
                        </FormControl>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 3 }}
                        >
                            Continue
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default PaymentPage;
