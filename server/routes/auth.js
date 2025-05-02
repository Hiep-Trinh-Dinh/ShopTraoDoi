const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    verifyEmail, 
    resendVerificationCode 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// Middleware to log requests
router.use((req, res, next) => {
    console.log('Auth Route:', req.method, req.path, req.body);
    next();
});

// Route đăng ký - Bước 1: Gửi mã xác thực
router.post('/register', register);

// Route xác thực email
router.post('/verify-email', verifyEmail);

// Route gửi lại mã xác thực
router.post('/resend-verification', resendVerificationCode);

// Route đăng nhập
router.post('/login', async (req, res, next) => {
    console.log('\n=== Login Route Handler Start ===');
    console.log('Request body:', req.body);
    
    try {
        if (!req.body || !req.body.email || !req.body.password) {
            console.log('Missing credentials in request body');
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }
        
        await login(req, res);
    } catch (error) {
        console.error('Login route error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Đã xảy ra lỗi khi đăng nhập'
        });
    }
});

// Add admin check route
router.get('/check-admin', protect, admin, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'User is admin'
    });
});

module.exports = router;
