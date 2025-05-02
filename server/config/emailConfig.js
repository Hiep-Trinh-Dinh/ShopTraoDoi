const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendVerificationEmail = async (email, verificationCode) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Xác thực tài khoản của bạn',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Xác thực tài khoản</h2>
                    <p>Mã xác thực của bạn là:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #4CAF50; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
                    </div>
                    <p>Mã này sẽ hết hạn sau 1 giờ.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('Email server verification error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

module.exports = {
    sendVerificationEmail
}; 