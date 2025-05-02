const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
    getProducts, 
    createProduct, 
    getProductById, 
    updateProduct, 
    deleteProduct,
    getFeaturedProducts
} = require('../controllers/productController');

// Thêm route cho featured products TRƯỚC /:id
router.get('/featured', getFeaturedProducts);

// Get all products
router.get('/', getProducts);

// Get single product
router.get('/:id', getProductById);

// Create product (Admin only)
router.post('/', protect, admin, createProduct);

// Update product (Admin only)
router.put('/:id', protect, admin, updateProduct);

// Delete product (Admin only)
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router; 