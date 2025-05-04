import { Box, Step, StepLabel, Stepper, Typography } from "@mui/material";
import React from "react";

interface CheckoutStepsProps {
    step: number;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ step }) => {
    const steps = [
        { label: "Cart", path: "/cart" },
        { label: "Shipping", path: "/shipping" },
        { label: "Review", path: "/review" },
    ];

    return (
        <Box sx={{ width: "100%", mb: 4 }}>
            <Stepper activeStep={step} alternativeLabel>
                {steps.map((stepItem) => (
                    <Step key={stepItem.label}>
                        <StepLabel>
                            <Typography
                                variant="body2"
                                color={
                                    step >= steps.indexOf(stepItem)
                                        ? "primary"
                                        : "text.secondary"
                                }
                            >
                                {stepItem.label}
                            </Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};

export default CheckoutSteps;
