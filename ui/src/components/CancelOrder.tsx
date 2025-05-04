import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";
import React, { useState } from "react";

interface CancelOrderProps {
    open: boolean;
    onClose: () => void;
    onCancel: (reason: string) => void;
}

const CancelOrder: React.FC<CancelOrderProps> = ({
    open,
    onClose,
    onCancel,
}) => {
    const [reason, setReason] = useState("");

    const handleCancel = () => {
        onCancel(reason);
        setReason("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Reason for cancellation"
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a reason for cancelling this order..."
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button
                    onClick={handleCancel}
                    color="error"
                    variant="contained"
                    disabled={!reason.trim()}
                >
                    Cancel Order
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancelOrder;
