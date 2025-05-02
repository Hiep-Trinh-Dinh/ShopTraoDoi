// server/server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import all routes
const roomRoutes = require('./routes/roomRoutes');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chatRoutes');

const http = require('http');
const setupWebSocket = require('./websocket');
const setupAdmin = require('./config/setupAdmin');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://shoptraodoi-client.onrender.com', 'https://shoptraodoi.onrender.com'] 
        : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Request logging middleware
app.use((req, res, next) => {
    console.log('\n=== Request Details ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('=== End Request ===\n');
    next();
});

// Connect to MongoDB and start server
const initializeServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create MongoDB store
        const store = new MongoDBStore({
            uri: process.env.MONGODB_URI,
            collection: 'sessions',
            connectionOptions: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        });

        store.on('error', function(error) {
            console.log('Session store error:', error);
        });

        // Session configuration
        app.use(session({
            secret: process.env.JWT_SECRET,
            cookie: {
                maxAge: 1000 * 60 * 60,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            },
            store: store,
            resave: true,
            saveUninitialized: true
        }));

        // API Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/cart', cartRoutes);
        app.use('/api/rooms', roomRoutes);
        app.use('/api/orders', orderRoutes);
        app.use('/api/admin', adminRoutes);
        app.use('/api/messages', messageRoutes);
        app.use('/api/chat', chatRoutes);

        // Test routes
        app.get('/test', (req, res) => {
            res.json({ message: 'Server is working' });
        });

        app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy',
                timestamp: new Date().toISOString()
            });
        });

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error('Global error handler:', err);
            res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Đã xảy ra lỗi',
                ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
            });
        });

        // 404 handler
        app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        });

        // Initialize WebSocket
        const wss = setupWebSocket(server);
        app.set('wss', wss);

        // Setup admin account
        await setupAdmin();

        // Start server
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`
====================================
🚀 Server running on port ${PORT}
📁 Environment: ${process.env.NODE_ENV}
📦 MongoDB connected
🔒 Session store initialized
📡 WebSocket server running
====================================
            `);
        });

    } catch (error) {
        console.error('Server initialization failed:', error);
        process.exit(1);
    }
};

// Start the server
initializeServer();

// Error handlers
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    server.close(() => process.exit(1));
});

module.exports = app;
