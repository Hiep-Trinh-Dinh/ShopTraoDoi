const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Token sẽ tự động xóa sau 1 giờ
    }
});

module.exports = mongoose.model('VerificationToken', verificationTokenSchema); 