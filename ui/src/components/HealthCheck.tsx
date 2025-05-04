import { Refresh as RefreshIcon } from "@mui/icons-material";
import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Tooltip,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { checkHealth, ServiceHealth } from "../services/adminService";

const HealthCheck: React.FC = () => {
    const [healthData, setHealthData] = useState<ServiceHealth[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHealth = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await checkHealth();
            setHealthData(response.services);
        } catch (err) {
            setError("Failed to fetch health status");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "healthy":
                return "success";
            case "unhealthy":
                return "error";
            default:
                return "default";
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography variant="h6">Service Health Status</Typography>
                <Tooltip title="Refresh health status">
                    <IconButton onClick={fetchHealth} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <Box>
                    {healthData.map((service) => (
                        <Box
                            key={service.service}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2,
                                p: 2,
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle1">
                                    {service.service.toUpperCase()} Service
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Last checked:{" "}
                                    {new Date(
                                        service.timestamp
                                    ).toLocaleString()}
                                </Typography>
                                {service.error && (
                                    <Typography
                                        variant="body2"
                                        color="error"
                                        sx={{ mt: 1 }}
                                    >
                                        Error: {service.error}
                                    </Typography>
                                )}
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                {service.responseTime && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Response: {service.responseTime}ms
                                    </Typography>
                                )}
                                <Chip
                                    label={service.status.toUpperCase()}
                                    color={getStatusColor(service.status)}
                                />
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Paper>
    );
};

export default HealthCheck;
