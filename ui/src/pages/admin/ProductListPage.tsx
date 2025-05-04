import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import {
    Box,
    Button,
    Chip,
    Container,
    IconButton,
    InputAdornment,
    Pagination,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import { deleteProduct, fetchProducts } from "../../store/slices/productSlice";
import { AppDispatch, RootState } from "../../store/store";

const ProductListPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { products, loading, error, page, pages } = useSelector(
        (state: RootState) => state.products
    );

    const [pageNumber, setPageNumber] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");

    useEffect(() => {
        // Debounce search term
        const timer = setTimeout(() => {
            dispatch(
                fetchProducts({
                    keyword: searchTerm,
                    pageNumber,
                    minPrice: minPrice !== "" ? minPrice : undefined,
                    maxPrice: maxPrice !== "" ? maxPrice : undefined,
                })
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [dispatch, pageNumber, searchTerm, minPrice, maxPrice]);

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            dispatch(deleteProduct(id));
        }
    };

    const handleChangePage = (
        event: React.ChangeEvent<unknown>,
        value: number
    ) => {
        setPageNumber(value);
    };

    if (loading) return <Loader />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 3,
                    }}
                >
                    <Typography variant="h4" component="h1">
                        Products
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate("/admin/product/new")}
                    >
                        Create Product
                    </Button>
                </Box>

                <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <TextField
                        label="Search Products"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="Min Price"
                        type="number"
                        variant="outlined"
                        value={minPrice}
                        onChange={(e) =>
                            setMinPrice(
                                e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                            )
                        }
                    />
                    <TextField
                        label="Max Price"
                        type="number"
                        variant="outlined"
                        value={maxPrice}
                        onChange={(e) =>
                            setMaxPrice(
                                e.target.value === ""
                                    ? ""
                                    : Number(e.target.value)
                            )
                        }
                    />
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Stock Quantity</TableCell>
                                <TableCell>Categories</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell>{product._id}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>${product.price}</TableCell>
                                    <TableCell>
                                        {product.stockQuantity}
                                    </TableCell>
                                    <TableCell>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            flexWrap="wrap"
                                        >
                                            {Array.isArray(
                                                product.categories
                                            ) ? (
                                                product.categories.map(
                                                    (category, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={category}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    )
                                                )
                                            ) : (
                                                <Chip
                                                    label={
                                                        product.category ||
                                                        "N/A"
                                                    }
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            product.createdAt
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() =>
                                                navigate(
                                                    `/admin/product/${product._id}/edit`
                                                )
                                            }
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() =>
                                                handleDelete(product._id)
                                            }
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Box display="flex" justifyContent="center" mt={4} mb={2}>
                        <Pagination
                            count={pages || 1}
                            page={pageNumber}
                            color="primary"
                            onChange={handleChangePage}
                        />
                    </Box>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default ProductListPage;
