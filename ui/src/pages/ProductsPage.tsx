import { Search as SearchIcon } from "@mui/icons-material";
import {
    Alert,
    Box,
    FormControl,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import ProductCard from "../components/product/ProductCard";
import { fetchProducts } from "../store/slices/productSlice";
import { AppDispatch, RootState } from "../store/store";

const categories = [
    "electronics",
    "clothing",
    "books",
    "home",
    "beauty",
    "toys",
    "sports",
    "automotive",
    "garden",
    "office",
];

const ProductsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const location = useLocation();
    const { keyword, pageNumber = "1" } = useParams<{
        keyword?: string;
        pageNumber?: string;
    }>();

    const [searchTerm, setSearchTerm] = useState(keyword || "");
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Extract category from query parameters
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get("category") || "";

    const {
        products = [],
        loading,
        error,
        page = 1,
        pages = 1,
    } = useSelector((state: RootState) => state.products);

    const navigate = useNavigate();

    useEffect(() => {
        dispatch(
            fetchProducts({
                keyword: keyword || "",
                pageNumber: parseInt(pageNumber, 10),
                category,
                pageSize: rowsPerPage,
            })
        );
    }, [dispatch, keyword, pageNumber, category, rowsPerPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products/search/${searchTerm}/page/1`);
        } else {
            // Clear search and navigate to products page
            navigate("/products/page/1");
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!e.target.value.trim()) {
            // Clear search when input is empty
            navigate("/products/page/1");
        }
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        const categoryParam = category ? `?category=${category}` : "";
        window.location.href = keyword
            ? `/products/search/${keyword}/page/${value}${categoryParam}`
            : `/products/page/${value}${categoryParam}`;
    };

    const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
        setRowsPerPage(event.target.value as number);
    };

    const handleCategoryChange = (event: SelectChangeEvent<string>) => {
        const categoryParam = event.target.value
            ? `?category=${event.target.value}`
            : "";
        window.location.href = keyword
            ? `/products/search/${keyword}/page/1${categoryParam}`
            : `/products/page/1${categoryParam}`;
    };

    return (
        <Box width="100%">
            <Grid sx={{ p: 2, mb: 3 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={2}
                >
                    <Typography variant="h4" component="h1" gutterBottom>
                        {category
                            ? `${
                                  category.charAt(0).toUpperCase() +
                                  category.slice(1)
                              } Products`
                            : "All Products"}
                    </Typography>

                    <Box display="flex" gap={2} alignItems="center">
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Select Category</InputLabel>
                            <Select
                                value={category}
                                label="Select Category"
                                onChange={handleCategoryChange}
                            >
                                <MenuItem value="">All</MenuItem>
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category.charAt(0).toUpperCase() +
                                            category.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <form onSubmit={handleSearch} style={{ width: 300 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </form>
                    </Box>
                </Box>
            </Grid>

            {keyword && (
                <Typography variant="h6" component="h2" gutterBottom>
                    Search Results for: {keyword}
                </Typography>
            )}

            {loading ? (
                <Loader />
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {products.length === 0 ? (
                            <Box width="100%" textAlign="center" my={4}>
                                <Typography variant="h5">
                                    No Products Found
                                </Typography>
                            </Box>
                        ) : (
                            products.map((product) => (
                                <Grid
                                    item
                                    key={product._id}
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    lg={3}
                                    xl={2}
                                >
                                    <ProductCard product={product} />
                                </Grid>
                            ))
                        )}
                    </Grid>

                    {/* Pagination */}
                    {pages > 1 && (
                        <Grid
                            direction="row"
                            container
                            alignItems={"center"}
                            justifyContent={"center"}
                            mt={4}
                            mb={2}
                        >
                            <Grid item>
                                <FormControl sx={{ minWidth: 120 }}>
                                    <InputLabel>Items per page</InputLabel>
                                    <Select
                                        value={rowsPerPage}
                                        label="Items per page"
                                        onChange={handleRowsPerPageChange}
                                    >
                                        <MenuItem value={10}>10</MenuItem>
                                        <MenuItem value={20}>20</MenuItem>
                                        <MenuItem value={30}>30</MenuItem>
                                        <MenuItem value={40}>40</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <Box display="flex" justifyContent="center">
                                    <Pagination
                                        count={pages}
                                        page={page}
                                        color="primary"
                                        onChange={handlePageChange}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </>
            )}
        </Box>
    );
};

export default ProductsPage;
