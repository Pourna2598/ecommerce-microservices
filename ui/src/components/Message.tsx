import { Alert, AlertProps } from "@mui/material";
import React from "react";

interface MessageProps extends AlertProps {
    children: React.ReactNode;
}

const Message: React.FC<MessageProps> = ({ children, ...props }) => {
    return <Alert {...props}>{children}</Alert>;
};

export default Message;
