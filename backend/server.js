const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://diyamarket.onrender.com'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { initAutomatedBackups } = require('./utils/backup');

// Init Backups
initAutomatedBackups();

// Routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const contractRoutes = require('./routes/contractRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// Serve React frontend (built files)
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

// All other routes → serve React app (for React Router)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://diyamarket.onrender.com'
        ],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
    console.log('A user connected via WebSocket:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.use((err, req, res, next) => {
    console.error('Express Error:', err);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
