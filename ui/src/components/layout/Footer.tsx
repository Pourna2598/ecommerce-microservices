import {
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    Twitter as TwitterIcon,
} from "@mui/icons-material";
import { Box, IconButton, Link, Stack, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                py: 1.5,
                px: { xs: 2, md: 4 },
                backgroundColor: (theme) => theme.palette.grey[900],
                color: "white",
                width: "100%",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "center", md: "center" },
                    width: "100%",
                }}
            >
                {/* Logo and Social Icons */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: { xs: 1, md: 0 },
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ mr: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}
                    >
                        E-Commerce
                    </Typography>

                    <IconButton
                        size="small"
                        color="inherit"
                        aria-label="Facebook"
                    >
                        <FacebookIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="inherit"
                        aria-label="Twitter"
                    >
                        <TwitterIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="inherit"
                        aria-label="Instagram"
                    >
                        <InstagramIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="inherit"
                        aria-label="LinkedIn"
                    >
                        <LinkedInIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Quick Links */}
                <Stack
                    direction="row"
                    spacing={{ xs: 2, md: 4 }}
                    alignItems="center"
                >
                    <Link
                        component={RouterLink}
                        to="/contact"
                        color="inherit"
                        sx={{ fontSize: "0.75rem" }}
                    >
                        Contact Us
                    </Link>
                    <Link
                        component={RouterLink}
                        to="/faq"
                        color="inherit"
                        sx={{ fontSize: "0.75rem" }}
                    >
                        FAQ
                    </Link>
                    <Link
                        component={RouterLink}
                        to="/terms"
                        color="inherit"
                        sx={{ fontSize: "0.75rem" }}
                    >
                        Terms
                    </Link>
                    <Link
                        component={RouterLink}
                        to="/privacy"
                        color="inherit"
                        sx={{ fontSize: "0.75rem" }}
                    >
                        Privacy
                    </Link>
                </Stack>

                {/* Copyright */}
                <Typography
                    variant="body2"
                    sx={{ fontSize: "0.75rem", ml: { md: 2 } }}
                >
                    © {currentYear} E-Commerce
                </Typography>
            </Box>
        </Box>
    );
};

export default Footer;
