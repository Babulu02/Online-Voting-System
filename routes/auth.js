const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

// User registration
router.post('/register', async (req, res) => {
    const { userId, name, email, password, dob, gender } = req.body;

    try {
        // Check if user already exists
        const [existingUser] = await db.execute(
            'SELECT id FROM users WHERE id = ? OR email = ?',
            [userId, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        await db.execute(
            'INSERT INTO users (id, name, email, dob, gender, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, name, email, dob, gender, passwordHash]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { userId, password } = req.body;

    try {
        // Find user
        const [users] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await db.execute(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;