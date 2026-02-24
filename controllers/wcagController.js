const mongoose = require('mongoose');
const Website = require('../models/Website');
const Review = require('../models/Review');

// Get all reviews with user and website info
async function getAllAssessments(userId = null) {
    try {
        const reviews = await Review.find()
            .populate('user', 'username')
            .populate('website', 'name url imageUrl')
            .sort({ upvotes: -1, downvotes: 1, createdAt: -1 })
            .lean();
        
        return reviews.map(review => {
            // Check if current user has voted
            let userVote = null;
            if (userId) {
                const existingVote = review.votedBy.find(v => v.user && v.user.toString() === userId.toString());
                if (existingVote) {
                    userVote = existingVote.vote;
                }
            }
            
            return {
                id: review._id,
                websiteName: review.website.name,
                websiteUrl: review.website.url,
                imageUrl: review.website.imageUrl,
                assessment: review.assessment,
                score: review.score,
                username: review.user.username,
                userId: review.user._id,
                criteriaChecked: review.criteriaChecked || [],
                createdAt: review.createdAt,
                upvotes: review.upvotes,
                downvotes: review.downvotes,
                totalVotes: review.upvotes - review.downvotes,
                userVote: userVote,
                wave: review.wave || { errors: 0, alerts: 0, features: 0, structuralElements: 0, html5AndARIA: 0 }
            };
        });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return [];
    }
}

// Get single review by ID
async function getAssessmentById(id, userId = null) {
    try {
        const review = await Review.findById(id)
            .populate('user', 'username')
            .populate('website', 'name url imageUrl')
            .lean();
        
        if (!review) return null;
        
        // Check if current user has voted
        let userVote = null;
        if (userId) {
            const existingVote = review.votedBy.find(v => v.user && v.user.toString() === userId.toString());
            if (existingVote) {
                userVote = existingVote.vote;
            }
        }
        
        return {
            id: review._id,
            websiteName: review.website.name,
            websiteUrl: review.website.url,
            imageUrl: review.website.imageUrl,
            assessment: review.assessment,
            score: review.score,
            username: review.user.username,
            userId: review.user._id,
            criteriaChecked: review.criteriaChecked || [],
            createdAt: review.createdAt,
            upvotes: review.upvotes,
            downvotes: review.downvotes,
            totalVotes: review.upvotes - review.downvotes,
            userVote: userVote,
            wave: review.wave || { errors: 0, alerts: 0, features: 0, structuralElements: 0, html5AndARIA: 0 }
        };
    } catch (error) {
        console.error('Error fetching assessment:', error);
        return null;
    }
}

// Add new assessment (requires authenticated user)
async function addAssessment(data, userId) {
    try {
        // Validate userId
        if (!userId) {
            throw new Error('Bruker er ikke logget inn');
        }
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Ugyldig bruker-ID');
        }
        
        // Validate required fields
        const websiteName = data.websiteName ? data.websiteName.trim() : '';
        const websiteUrl = data.websiteUrl ? data.websiteUrl.trim() : '';
        
        if (!websiteName || websiteName.length < 2) {
            throw new Error('Nettstedsnavn må være minst 2 tegn');
        }
        
        if (!websiteUrl) {
            throw new Error('Nettsteds-URL er påkrevd');
        }
        
        // Validate score
        const score = parseInt(data.score) || 100;
        if (score < 0 || score > 100) {
            throw new Error('Score må være mellom 0 og 100');
        }
        
        // Validate assessment text
        if (!data.assessment || data.assessment.trim().length === 0) {
            throw new Error('Vurderingsteksten er påkrevd');
        }
        
        // Find or create website
        let website = await Website.findOne({ url: websiteUrl });
        if (!website) {
            // Use free screenshot service (thum.io - no API key needed)
            const screenshotUrl = `https://image.thum.io/get/width/1200/crop/675/${encodeURIComponent(websiteUrl)}`;
            
            website = new Website({
                name: websiteName,
                url: websiteUrl,
                imageUrl: screenshotUrl
            });
            await website.save();
        }

        // Create review with user reference
        // Handle optional criteriaChecked field - split by comma if provided
        let criteriaChecked = [];
        if (data.criteriaChecked && typeof data.criteriaChecked === 'string') {
            criteriaChecked = data.criteriaChecked.split(',').map(c => c.trim()).filter(c => c);
        }
        
        const review = new Review({
            user: userId,
            website: website._id,
            score: score,
            assessment: data.assessment,
            criteriaChecked: criteriaChecked,
            wave: {
                errors: parseInt(data.waveErrors) || 0,
                alerts: parseInt(data.waveAlerts) || 0,
                features: parseInt(data.waveFeatures) || 0,
                structuralElements: parseInt(data.waveStructural) || 0,
                html5AndARIA: parseInt(data.waveARIA) || 0,
                rawResults: {
                    errors: parseInt(data.waveErrors) || 0,
                    alerts: parseInt(data.waveAlerts) || 0,
                    features: parseInt(data.waveFeatures) || 0,
                    structural: parseInt(data.waveStructural) || 0,
                    aria: parseInt(data.waveARIA) || 0
                },
                evaluatedAt: new Date()
            }
        });

        await review.save();
        
        // Get user info
        const user = await require('../models/User').findById(userId);
        
        return {
            id: review._id,
            websiteName: website.name,
            websiteUrl: website.url,
            imageUrl: website.imageUrl,
            assessment: review.assessment,
            score: review.score,
            username: user ? user.username : 'Ukjent',
            criteriaChecked: review.criteriaChecked,
            upvotes: 0,
            downvotes: 0,
            totalVotes: 0,
            wave: review.wave
        };
    } catch (error) {
        console.error('Error adding assessment:', error);
        throw error;
    }
}

module.exports = {
    getAllAssessments,
    getAssessmentById,
    addAssessment
};

