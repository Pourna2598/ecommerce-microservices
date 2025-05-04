import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import Message from "../components/Message";
import { updateUserProfile } from "../store/slices/authSlice";
import { AppDispatch, RootState } from "../store/store";

interface UpdateProfileData {
    name: string;
    email: string;
    password?: string;
}

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user, loading, error } = useSelector(
        (state: RootState) => state.auth
    );

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            navigate("/login");
        } else {
            setName(user.name);
            setEmail(user.email);
        }
    }, [navigate, user]);

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
        } else {
            const updateData: UpdateProfileData = {
                name,
                email,
            };
            if (password) {
                updateData.password = password;
            }
            dispatch(updateUserProfile(updateData));
            setMessage(null);
        }
    };

    if (loading) return <Loader />;
    if (error) return <Message severity="error">{error}</Message>;

    return (
        <Container maxWidth="sm">
            <Box sx={{ my: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        User Profile
                    </Typography>
                    {message && <Message severity="error">{message}</Message>}
                    <form onSubmit={submitHandler}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            margin="normal"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 3 }}
                        >
                            Update
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default ProfilePage;
