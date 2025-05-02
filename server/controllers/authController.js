const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const { sendVerificationEmail } = require('../config/emailConfig');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Tạo mã xác thực ngẫu nhiên 6 chữ số
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Đăng ký tài khoản - Bước 1: Gửi mã xác thực
exports.register = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Kiểm tra email đã tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Tạo mã xác thực
        const verificationCode = generateVerificationCode();

        // Lưu thông tin đăng ký tạm thời và mã xác thực
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Xóa token cũ nếu có
        await VerificationToken.deleteMany({ email });

        // Tạo token mới
        const verificationToken = new VerificationToken({
            email,
            token: verificationCode
        });
        await verificationToken.save();

        // Lưu thông tin user tạm thời vào session
        req.session.pendingUser = {
            email,
            password: hashedPassword,
            username
        };

        // Gửi email xác thực
        const emailSent = await sendVerificationEmail(email, verificationCode);
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: 'Không thể gửi email xác thực'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mã xác thực đã được gửi đến email của bạn'
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng ký'
        });
    }
};

// Gửi lại mã xác thực
exports.resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        // Tạo mã xác thực mới
        const verificationCode = generateVerificationCode();

        // Cập nhật token mới
        await VerificationToken.findOneAndUpdate(
            { email },
            { token: verificationCode },
            { new: true, upsert: true }
        );

        // Gửi lại email
        const emailSent = await sendVerificationEmail(email, verificationCode);
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: 'Không thể gửi lại mã xác thực'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Mã xác thực mới đã được gửi'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi gửi lại mã xác thực'
        });
    }
};

// Xác thực mã và hoàn tất đăng ký
exports.verifyEmail = async (req, res) => {
    try {
        console.log('\n=== Verify Email Start ===');
        const { email, verificationCode } = req.body;
        console.log('Verifying email for:', email);

        // Kiểm tra mã xác thực
        const verificationToken = await VerificationToken.findOne({
            email,
            token: verificationCode
        });

        if (!verificationToken) {
            console.log('Invalid verification token for:', email);
            return res.status(400).json({
                success: false,
                message: 'Mã xác thực không hợp lệ hoặc đã hết hạn'
            });
        }

        // Lấy thông tin user từ session
        const pendingUser = req.session.pendingUser;
        console.log('Pending user from session:', {
            exists: !!pendingUser,
            email: pendingUser?.email,
            hasPassword: !!pendingUser?.password
        });

        if (!pendingUser) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin đăng ký không tồn tại'
            });
        }

        // Tạo và lưu user trực tiếp vào database để tránh middleware
        const result = await User.collection.insertOne({
            email: pendingUser.email,
            username: pendingUser.username,
            password: pendingUser.password,
            isVerified: true,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('User saved successfully:', result.insertedId);

        // Xóa token xác thực và thông tin tạm thời
        await VerificationToken.deleteOne({ _id: verificationToken._id });
        delete req.session.pendingUser;

        // Tạo JWT token
        const token = jwt.sign(
            { 
                userId: result.insertedId,
                role: 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('=== Verify Email End ===\n');

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            token
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi xác thực email'
        });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('\n=== Login Controller Start ===');
        console.log('Raw request body:', req.body);
        console.log('Content-Type:', req.headers['content-type']);

        const { email, password } = req.body;
        console.log('Attempting login for email:', email);

        // First find user without password
        const user = await User.findOne({ email });
        console.log('Initial user lookup result:', { found: !!user, email });

        if (!user) {
            console.log('User not found:', email);
            return res.status(400).json({
                success: false,
                message: 'Email hoặc mật khẩu không chính xác'
            });
        }

        // Then get user with password
        const userWithPassword = await User.findOne({ email }).select('+password');
        console.log('User with password lookup:', {
            found: !!userWithPassword,
            hasPassword: !!userWithPassword?.password,
            passwordHash: userWithPassword?.password // Log the actual hash
        });

        if (!userWithPassword || !userWithPassword.password) {
            console.log('Password field missing in document');
            return res.status(500).json({
                success: false,
                message: 'Lỗi xác thực tài khoản'
            });
        }

        // Compare password
        console.log('Comparing passwords:', {
            provided: password,
            stored: userWithPassword.password
        });

        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, userWithPassword.password);
            console.log('Password comparison result:', isMatch);
        } catch (error) {
            console.error('Password comparison error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi xác thực mật khẩu'
            });
        }

        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(400).json({
                success: false,
                message: 'Email hoặc mật khẩu không chính xác'
            });
        }

        // Check verification
        if (!user.isVerified) {
            console.log('Unverified account:', email);
            return res.status(400).json({
                success: false,
                message: 'Tài khoản chưa được xác thực. Vui lòng xác thực email trước khi đăng nhập',
                requiresVerification: true
            });
        }

        // Create token
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful:', {
            userId: user._id,
            email: user.email,
            isVerified: user.isVerified
        });

        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                role: user.role
            },
            token
        });
        
        console.log('=== Login Controller End ===\n');
    } catch (error) {
        console.error('Login controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng nhập',
            error: error.message
        });
    }
};
