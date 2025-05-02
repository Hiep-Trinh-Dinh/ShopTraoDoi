const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    addToCart, 
    getCart, 
    updateCartItem 
} = require('../controllers/cartController');

// Apply auth middleware to all cart routes
router.use(protect);

// Add to cart
router.post('/add', addToCart);

// Get cart
router.get('/', getCart);

// Update cart item
router.put('/update', updateCartItem);

module.exports = router;