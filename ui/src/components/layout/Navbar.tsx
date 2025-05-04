import {
    ShoppingCart as CartIcon,
    Close as CloseIcon,
    Dashboard as DashboardIcon,
    Home as HomeIcon,
    Inventory as InventoryIcon,
    Assignment as OrdersIcon,
    Group as UsersIcon,
} from "@mui/icons-material";
import {
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/store";

interface NavbarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.isAdmin;

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

    // Drawer content
    const drawerContent = (
        <Box sx={{ width: 280 }} role="presentation">
            <List>
                <ListItem sx={{ justifyContent: "space-between" }}>
                    <Typography variant="h6">Navigation</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </ListItem>

                <Divider />

                {!user?.isAdmin && (
                    <>
                        <ListItem button onClick={() => handleNavigate("/")}>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem>
                        <ListItem
                            button
                            onClick={() => handleNavigate("/products")}
                        >
                            <ListItemIcon>
                                <InventoryIcon />
                            </ListItemIcon>
                            <ListItemText primary="Products" />
                        </ListItem>

                        {/* Routes for authenticated users */}
                        <ListItem
                            button
                            onClick={() => handleNavigate("/cart")}
                        >
                            <ListItemIcon>
                                <CartIcon />
                            </ListItemIcon>
                            <ListItemText primary="Cart" />
                        </ListItem>

                        <ListItem
                            button
                            onClick={() => handleNavigate("/my-orders")}
                        >
                            <ListItemIcon>
                                <OrdersIcon />
                            </ListItemIcon>
                            <ListItemText primary="My Orders" />
                        </ListItem>
                    </>
                )}

                {isAdmin && (
                    <>
                        <ListItem
                            button
                            onClick={() => handleNavigate("/admin/dashboard")}
                        >
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>

                        <ListItem
                            button
                            onClick={() => handleNavigate("/admin/productlist")}
                        >
                            <ListItemIcon>
                                <InventoryIcon />
                            </ListItemIcon>
                            <ListItemText primary="Products" />
                        </ListItem>

                        <ListItem
                            button
                            onClick={() => handleNavigate("/admin/orderlist")}
                        >
                            <ListItemIcon>
                                <OrdersIcon />
                            </ListItemIcon>
                            <ListItemText primary="Orders" />
                        </ListItem>
                        <ListItem
                            button
                            onClick={() => handleNavigate("/admin/userlist")}
                        >
                            <ListItemIcon>
                                <UsersIcon />
                            </ListItemIcon>
                            <ListItemText primary="Users" />
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <Drawer anchor="left" open={isOpen} onClose={onClose}>
            {drawerContent}
        </Drawer>
    );
};

export default Navbar;
