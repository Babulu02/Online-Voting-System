const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateAdmin } = require('./admin-auth');

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Get admin dashboard stats
router.get('/dashboard/stats', async (req, res) => {
    try {
        const [userCount] = await db.execute('SELECT COUNT(*) as count FROM users');
        const [electionCount] = await db.execute('SELECT COUNT(*) as count FROM elections');
        const [activeElectionCount] = await db.execute('SELECT COUNT(*) as count FROM elections WHERE status = "active"');
        const [totalVotes] = await db.execute('SELECT SUM(votes_cast) as total FROM elections');

        res.json({
            success: true,
            stats: {
                totalUsers: userCount[0].count,
                totalElections: electionCount[0].count,
                activeElections: activeElectionCount[0].count,
                totalVotesCast: totalVotes[0].total || 0
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT id, name, email, dob, gender, has_voted, registered_at, last_login 
            FROM users 
            ORDER BY registered_at DESC
        `);

        res.json({
            success: true,
            users: users
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

module.exports = router;