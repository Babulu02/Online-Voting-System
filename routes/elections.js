const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all elections
router.get('/', async (req, res) => {
    try {
        const [elections] = await db.execute(`
            SELECT e.*, 
                   COUNT(DISTINCT v.user_id) as votes_cast,
                   (COUNT(DISTINCT v.user_id) / NULLIF(e.total_voters, 0)) * 100 as participation_rate
            FROM elections e
            LEFT JOIN votes v ON e.id = v.election_id
            GROUP BY e.id
            ORDER BY e.start_date DESC
        `);

        res.json({
            success: true,
            elections: elections
        });

    } catch (error) {
        console.error('Get elections error:', error);
        res.status(500).json({ error: 'Failed to fetch elections' });
    }
});

// Get election details with candidates
router.get('/:id', async (req, res) => {
    try {
        const electionId = req.params.id;

        const [elections] = await db.execute(
            'SELECT * FROM elections WHERE id = ?',
            [electionId]
        );

        if (elections.length === 0) {
            return res.status(404).json({ error: 'Election not found' });
        }

        const [positions] = await db.execute(
            'SELECT * FROM positions WHERE election_id = ?',
            [electionId]
        );

        // Get candidates for each position
        for (let position of positions) {
            const [candidates] = await db.execute(
                'SELECT * FROM candidates WHERE position_id = ?',
                [position.id]
            );
            position.candidates = candidates;
        }

        res.json({
            success: true,
            election: elections[0],
            positions: positions
        });

    } catch (error) {
        console.error('Get election error:', error);
        res.status(500).json({ error: 'Failed to fetch election' });
    }
});

module.exports = router;