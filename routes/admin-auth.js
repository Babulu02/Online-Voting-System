const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Admin registration (only for super admin)
router.post('/register', async (req, res) => {
    const { username, email, password, role = 'admin' } = req.body;

    try {
        // Check if admin already exists
        const [existingAdmin] = await db.execute(
            'SELECT id FROM admins WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingAdmin.length > 0) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create admin
        const [result] = await db.execute(
            'INSERT INTO admins (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, role]
        );

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            adminId: result.insertId
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});

// Admin login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find admin
        const [admins] = await db.execute(
            'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
            [username]
        );

        if (admins.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = admins[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await db.execute(
            'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [admin.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { 
                adminId: admin.id, 
                username: admin.username,
                role: admin.role 
            },
            process.env.JWT_SECRET || 'admin_secret_key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Middleware to verify admin token
const authenticateAdmin = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin_secret_key');
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

module.exports = { router, authenticateAdmin };