const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Cast vote
router.post('/cast', async (req, res) => {
    const { userId, electionId, votes } = req.body; // votes: [{positionId, candidateId}]

    try {
        // Check if user has already voted in this election
        const [existingVotes] = await db.execute(
            'SELECT id FROM votes WHERE user_id = ? AND election_id = ?',
            [userId, electionId]
        );

        if (existingVotes.length > 0) {
            return res.status(400).json({ error: 'You have already voted in this election' });
        }

        // Record votes
        for (const vote of votes) {
            await db.execute(
                'INSERT INTO votes (user_id, election_id, position_id, candidate_id) VALUES (?, ?, ?, ?)',
                [userId, electionId, vote.positionId, vote.candidateId]
            );

            // Update candidate vote count
            await db.execute(
                'UPDATE candidates SET votes = votes + 1 WHERE id = ?',
                [vote.candidateId]
            );
        }

        // Update user has_voted status
        await db.execute(
            'UPDATE users SET has_voted = TRUE WHERE id = ?',
            [userId]
        );

        // Update election votes cast
        await db.execute(
            'UPDATE elections SET votes_cast = votes_cast + 1 WHERE id = ?',
            [electionId]
        );

        res.json({
            success: true,
            message: 'Vote cast successfully'
        });

    } catch (error) {
        console.error('Vote casting error:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
});

// Get election results
router.get('/results/:electionId', async (req, res) => {
    try {
        const electionId = req.params.electionId;

        const [results] = await db.execute(`
            SELECT 
                p.title as position,
                c.name as candidate_name,
                c.party as candidate_party,
                c.votes as vote_count,
                (c.votes / NULLIF(SUM(c.votes) OVER(PARTITION BY p.id), 0)) * 100 as percentage
            FROM positions p
            JOIN candidates c ON p.id = c.position_id
            WHERE p.election_id = ?
            ORDER BY p.id, c.votes DESC
        `, [electionId]);

        res.json({
            success: true,
            results: results
        });

    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

module.exports = router;