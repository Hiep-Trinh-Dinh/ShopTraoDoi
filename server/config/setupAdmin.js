const User = require('../models/User');

const setupAdmin = async () => {
    try {
        // Kiểm tra xem đã có admin chưa
        const adminExists = await User.findOne({ role: 'admin' });
        
        if (!adminExists) {
            // Tạo tài khoản admin - KHÔNG hash password ở đây
            // Model sẽ tự động hash trong middleware pre-save
            const admin = await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123', // Password gốc, sẽ được hash tự động
                role: 'admin',
                isVerified: true
            });
            
            console.log('Admin account created:', {
                email: admin.email,
                username: admin.username
            });
        } else {
            console.log('Admin account already exists');
        }
    } catch (error) {
        console.error('Error setting up admin:', error);
    }
};

module.exports = setupAdmin; 