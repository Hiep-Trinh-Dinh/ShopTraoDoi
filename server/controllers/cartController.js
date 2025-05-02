const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        console.log('Request body:', req.body);
        console.log('User ID:', userId);

        // Validate productId
        if (!productId) {
            console.log('Invalid productId:', productId);
            return res.status(400).json({
                success: false,
                message: 'ProductId không hợp lệ'
            });
        }

        // Validate quantity
        const parsedQuantity = parseInt(quantity);
        if (isNaN(parsedQuantity) || parsedQuantity < 1) {
            console.log('Invalid quantity:', quantity);
            return res.status(400).json({
                success: false,
                message: 'Số lượng phải là số nguyên dương'
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            console.log('Product not found:', productId);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [{ product: productId, quantity: parsedQuantity }]
            });
        } else {
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex > -1) {
                cart.items[existingItemIndex].quantity += parsedQuantity;
            } else {
                cart.items.push({ product: productId, quantity: parsedQuantity });
            }
        }

        await cart.save();
        await cart.populate('items.product');

        console.log('Cart updated successfully:', cart);

        res.json({
            success: true,
            cart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm vào giỏ hàng: ' + error.message
        });
    }
};

// Get cart
exports.getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId })
            .populate('items.product');

        res.json({
            success: true,
            cart: cart || { items: [] }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cart'
        });
    }
};

// Update cart item
exports.updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(item => 
                item.product.toString() !== productId
            );
        } else {
            const item = cart.items.find(item => 
                item.product.toString() === productId
            );
            if (item) {
                item.quantity = quantity;
            }
        }

        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            cart
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating cart'
        });
    }
};