const express = require('express')
const router = express.Router()
const { createOrder, getOrders, getOrderById } = require('../controllers/orderController')
const { protect, admin } = require('../middleware/authMiddleware')
const Order = require('../models/Order')

router.post('/', protect, createOrder)
router.get('/admin', protect, admin, getOrders)
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .sort({ createdAt: -1 })
        res.json({
            success: true,
            orders
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})
router.get('/:id', protect, getOrderById)
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body
        const order = await Order.findById(req.params.id)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        if (!order.canUpdateStatus(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status transition'
            })
        }

        order.status = status
        await order.save()

        res.json({
            success: true,
            order
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

module.exports = router 