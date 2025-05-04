import {
    LogoutOutlined as LogoutIcon,
    Menu as MenuIcon,
    Person as PersonIcon,
    ShoppingCart as ShoppingCartIcon,
} from "@mui/icons-material";
import {
    AppBar,
    Badge,
    Box,
    IconButton,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store/store";
import Notifications from "../Notifications";

interface HeaderProps {
    onMenuOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuOpen }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Cart items
    const cartItems = useSelector((state: RootState) => state.cart.cartItems);

    // Handle logout
    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    // Navigate to profile
    const handleProfileClick = () => {
        navigate("/profile");
    };

    // Navigate to cart
    const handleCartClick = () => {
        navigate("/cart");
    };

    return (
        <AppBar position="static" sx={{ p: 0, m: 0, width: "100%" }}>
            <Toolbar>
                {/* Menu Toggle Button */}
                <IconButton
                    color="inherit"
                    edge="start"
                    onClick={onMenuOpen}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                {/* App Title */}
                <Typography
                    variant="h6"
                    component={Link}
                    to="/"
                    sx={{
                        textDecoration: "none",
                        color: "inherit",
                        fontWeight: "bold",
                    }}
                >
                    E-Commerce
                </Typography>

                {/* Spacer */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Notifications */}
                <Notifications />

                {/* Profile Button */}
                <Tooltip title="Profile">
                    <IconButton
                        color="inherit"
                        onClick={handleProfileClick}
                        sx={{ mr: 1 }}
                    >
                        <PersonIcon />
                    </IconButton>
                </Tooltip>

                {/* Cart Button */}
                <Tooltip title="Cart">
                    <IconButton color="inherit" onClick={handleCartClick}>
                        <Badge badgeContent={cartItems.length} color="error">
                            <ShoppingCartIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* Logout Button */}
                <Tooltip title="Logout">
                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Tooltip>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
