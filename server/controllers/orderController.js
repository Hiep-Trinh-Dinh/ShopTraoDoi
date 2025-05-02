const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Product = require('../models/Product')

// Create order
const createOrder = async (req, res) => {
    try {
        const { shippingInfo, paymentMethod } = req.body
        const userId = req.user._id

        console.log('Creating order for user:', userId)
        console.log('Shipping info:', shippingInfo)
        console.log('Payment method:', paymentMethod)

        // Validate input
        if (!shippingInfo || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            })
        }

        // Get user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product')
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            })
        }

        // Calculate total
        const totalAmount = cart.items.reduce((total, item) => {
            return total + (item.product.price * item.quantity)
        }, 0)

        // Create order
        const order = new Order({
            user: userId,
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            })),
            shippingInfo,
            paymentMethod,
            totalAmount,
            status: paymentMethod === 'cod' ? 'pending' : 'processing',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'processing'
        })

        // Save order (this will trigger the pre-save hook to generate orderNumber)
        await order.save()
        console.log('Order created:', order._id, 'Order number:', order.orderNumber)

        // Update product status
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                status: 'reserved',
                paymentStatus: paymentMethod === 'cod' ? 'pending' : 'processing'
            })
        }

        // Clear cart
        await Cart.findOneAndDelete({ user: userId })

        // Populate order details
        await order.populate('items.product')

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        })
    } catch (error) {
        console.error('Error creating order:', error)
        res.status(500).json({
            success: false,
            message: 'Error creating order: ' + error.message
        })
    }
}

// Get all orders
const getOrders = async (req, res) => {
    try {
        const userId = req.user._id
        const orders = await Order.find({ user: userId })
            .populate('items.product')
            .sort({ createdAt: -1 })

        res.json({
            success: true,
            orders
        })
    } catch (error) {
        console.error('Error fetching orders:', error)
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách đơn hàng'
        })
    }
}

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product')
            .populate('user', 'name email')

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            })
        }

        res.json({
            success: true,
            order
        })
    } catch (error) {
        console.error('Error fetching order:', error)
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thông tin đơn hàng'
        })
    }
}

// Export all functions
module.exports = {
    createOrder,
    getOrders,
    getOrderById
} 