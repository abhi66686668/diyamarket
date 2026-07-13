const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Authenticate admin & get token
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const admin = await Admin.findOne({ username });

        if (admin && (await admin.matchPassword(password))) {
            res.json({
                _id: admin._id,
                username: admin.username,
                token: generateToken(admin._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin profile
// @route   GET /api/auth/profile
// @access  Private
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id);
        if (admin) {
            res.json({
                _id: admin._id,
                username: admin.username,
            });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new admin (Hidden route for initial setup)
// @route   POST /api/auth/setup
// @access  Public
const setupAdmin = async (req, res) => {
    try {
        const adminExists = await Admin.countDocuments();
        if (adminExists > 0) {
            return res.status(400).json({ message: 'Admin already exists. Setup disabled.' });
        }

        const { username, password } = req.body;
        
        if(!username || !password) {
             return res.status(400).json({ message: 'Username and password required' });
        }

        const admin = await Admin.create({
            username,
            password
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                username: admin.username,
                token: generateToken(admin._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid admin data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    loginAdmin,
    getAdminProfile,
    setupAdmin
};
