const Review = require('../models/Review');

// Vote on a review
async function vote(req, res) {
    try {
        const { reviewId } = req.params;
        const { vote } = req.body;
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Du må være logget inn for å stemme' });
        }
        
        if (!['up', 'down'].includes(vote)) {
            return res.status(400).json({ error: 'Ugyldig stemme' });
        }
        
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Vurdering ikke funnet' });
        }
        
        // Check if user already voted
        const existingVoteIndex = review.votedBy.findIndex(v => v.user && v.user.toString() === userId.toString());
        let currentUserVote = null;
        
        if (existingVoteIndex > -1) {
            currentUserVote = review.votedBy[existingVoteIndex].vote;
            
            if (currentUserVote === vote) {
                // Same vote - remove it (toggle off)
                if (vote === 'up') {
                    review.upvotes -= 1;
                } else {
                    review.downvotes -= 1;
                }
                review.votedBy.splice(existingVoteIndex, 1);
                currentUserVote = null;
            } else {
                // Different vote - change it
                if (vote === 'up') {
                    review.upvotes += 1;
                    review.downvotes -= 1;
                } else {
                    review.downvotes += 1;
                    review.upvotes -= 1;
                }
                review.votedBy[existingVoteIndex].vote = vote;
                currentUserVote = vote;
            }
        } else {
            // New vote
            if (vote === 'up') {
                review.upvotes += 1;
            } else {
                review.downvotes += 1;
            }
            review.votedBy.push({ user: userId, vote });
            currentUserVote = vote;
        }
        
        await review.save();
        
        res.json({
            success: true,
            upvotes: review.upvotes,
            downvotes: review.downvotes,
            totalVotes: review.upvotes - review.downvotes,
            userVote: currentUserVote
        });
    } catch (error) {
        console.error('Vote error:', error);
        res.status(500).json({ error: 'Feil ved stemme' });
    }
}

module.exports = {
    vote
};

