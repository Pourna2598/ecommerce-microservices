import React from 'react';
import { CircularProgress, Box } from '@mui/material';

interface LoaderProps {
    size?: number;
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
    thickness?: number;
}

const Loader: React.FC<LoaderProps> = ({
    size = 50,
    color = 'primary',
    thickness = 4
}) => {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ py: 3 }}
        >
            <CircularProgress
                size={size}
                color={color}
                thickness={thickness}
            />
        </Box>
    );
};

export default Loader; 