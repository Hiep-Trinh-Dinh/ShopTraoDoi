const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vui lòng nhập tên sản phẩm']
    },
    description: {
        type: String,
        required: [true, 'Vui lòng nhập mô tả']
    },
    price: {
        type: Number,
        required: [true, 'Vui lòng nhập giá'],
        min: [0, 'Giá không thể âm']
    },
    image: {
        type: String,
        default: "/placeholder.svg"
    },
    category: {
        type: String,
        required: [true, 'Vui lòng chọn danh mục']
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'reserved'],
        default: 'available'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'processing'],
        default: 'unpaid'
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'shipping', 'delivered'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Thêm virtual field cho formatted price
productSchema.virtual('formattedPrice').get(function() {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(this.price);
});

// Thêm index để tìm kiếm
productSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema); 