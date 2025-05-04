import {
    Box,
    Button,
    Chip,
    Container,
    Grid,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import {
    createProduct,
    fetchProductDetails,
    updateProduct,
} from "../../store/slices/productSlice";
import { AppDispatch, RootState } from "../../store/store";

const ProductEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const {
        product: selectedProduct,
        loading,
        error,
    } = useSelector((state: RootState) => state.products);

    const isEditMode = id !== undefined && id !== "new";

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        stockQuantity: 0,
        categories: [] as string[],
        newCategory: "", // For adding new categories
    });

    useEffect(() => {
        if (isEditMode && id) {
            dispatch(fetchProductDetails(id));
        }
    }, [dispatch, id, isEditMode]);

    useEffect(() => {
        if (isEditMode && selectedProduct) {
            setFormData({
                name: selectedProduct.name,
                description: selectedProduct.description,
                price: selectedProduct.price,
                stockQuantity: selectedProduct.stockQuantity || 0,
                categories: Array.isArray(selectedProduct.categories)
                    ? selectedProduct.categories
                    : selectedProduct.category
                    ? [selectedProduct.category]
                    : [],
                newCategory: "",
            });
        }
    }, [selectedProduct, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]:
                name === "price" || name === "stockQuantity"
                    ? Number(value)
                    : value,
        });
    };

    const handleAddCategory = () => {
        if (
            formData.newCategory &&
            !formData.categories.includes(formData.newCategory)
        ) {
            setFormData({
                ...formData,
                categories: [...formData.categories, formData.newCategory],
                newCategory: "",
            });
        }
    };

    const handleDeleteCategory = (categoryToDelete: string) => {
        setFormData({
            ...formData,
            categories: formData.categories.filter(
                (category) => category !== categoryToDelete
            ),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data for API
        const productData = {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            stockQuantity: formData.stockQuantity,
            categories: formData.categories,
        };

        if (isEditMode && id) {
            dispatch(updateProduct({ id, productData }));
        } else {
            dispatch(createProduct(productData));
        }
        navigate("/admin/productlist");
    };

    if (loading) return <Loader />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEditMode ? "Edit Product" : "Create New Product"}
                </Typography>
                <Paper sx={{ p: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Stock Quantity"
                                    name="stockQuantity"
                                    type="number"
                                    value={formData.stockQuantity}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    multiline
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography
                                        variant="subtitle1"
                                        gutterBottom
                                    >
                                        Categories
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 1,
                                        }}
                                    >
                                        {formData.categories.map(
                                            (category, index) => (
                                                <Chip
                                                    key={index}
                                                    label={category}
                                                    onDelete={() =>
                                                        handleDeleteCategory(
                                                            category
                                                        )
                                                    }
                                                />
                                            )
                                        )}
                                    </Box>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <TextField
                                        fullWidth
                                        label="Add Category"
                                        name="newCategory"
                                        value={formData.newCategory}
                                        onChange={handleChange}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={handleAddCategory}
                                    >
                                        Add
                                    </Button>
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                    >
                                        {isEditMode
                                            ? "Update Product"
                                            : "Create Product"}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            navigate("/admin/productlist")
                                        }
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default ProductEditPage;
