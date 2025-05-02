const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
    getStats, 
    getAllUsers, 
    updateUser, 
    deleteUser, 
    createUser,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/adminController');

// Stats routes
router.get('/stats', protect, admin, getStats);

// User management routes
router.get('/users', protect, admin, getAllUsers);
router.post('/users', protect, admin, createUser);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);

// Order management routes
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:orderId/status', protect, admin, updateOrderStatus);

module.exports = router; 