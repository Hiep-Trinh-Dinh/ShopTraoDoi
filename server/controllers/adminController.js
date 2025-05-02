const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get dashboard stats
exports.getStats = async (req, res) => {
    try {
        // Tính tổng số lượng
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Tính tổng doanh thu từ đơn hàng đã giao
        const completedOrders = await Order.find({ 
            status: 'delivered',
            paymentStatus: 'paid'
        });
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Lấy đơn hàng gần đây
        const recentOrders = await Order.find()
            .populate({
                path: 'items.product',
                select: 'name price image'
            })
            .sort({ createdAt: -1 })
            .limit(5);

        // Thống kê theo trạng thái đơn hàng
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue
            },
            orderStats,
            recentOrders
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê'
        });
    }
};

// Get all orders with details
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'items.product',
                select: 'name price image'
            })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đơn hàng'
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Cập nhật trạng thái đơn hàng
        order.status = status;

        // Cập nhật trạng thái thanh toán nếu cần
        if (status === 'delivered' && order.paymentMethod === 'cod') {
            order.paymentStatus = 'paid';
        } else if (status === 'cancelled') {
            order.paymentStatus = 'failed';
        }

        await order.save();

        // Populate thông tin chi tiết sau khi cập nhật
        const updatedOrder = await Order.findById(orderId)
            .populate({
                path: 'items.product',
                select: 'name price image'
            });

        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái đơn hàng'
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const user = await User.create({
            username,
            email,
            password,
            role,
            isVerified: true // Admin created users are automatically verified
        });
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deletion of admin users
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete admin users'
            });
        }

        await user.remove();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
}; 