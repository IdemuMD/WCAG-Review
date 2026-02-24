const User = require('../models/User');
const Website = require('../models/Website');
const Review = require('../models/Review');

// Get all reviews with user and website info
async function getAllAssessments() {
    try {
        const reviews = await Review.find()
            .populate('user', 'username')
            .populate('website', 'name url imageUrl')
            .sort({ createdAt: -1 })
            .lean();
        
        return reviews.map(review => ({
            id: review._id,
            websiteName: review.website.name,
            websiteUrl: review.website.url,
            imageUrl: review.website.imageUrl,
            assessment: review.assessment,
            score: review.score,
            username: review.user.username,
            criteriaChecked: review.criteriaChecked || [],
            createdAt: review.createdAt
        }));
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return [];
    }
}

// Get single review by ID
async function getAssessmentById(id) {
    try {
        const review = await Review.findById(id)
            .populate('user', 'username')
            .populate('website', 'name url imageUrl')
            .lean();
        
        if (!review) return null;
        
        return {
            id: review._id,
            websiteName: review.website.name,
            websiteUrl: review.website.url,
            imageUrl: review.website.imageUrl,
            assessment: review.assessment,
            score: review.score,
            username: review.user.username,
            criteriaChecked: review.criteriaChecked || [],
            createdAt: review.createdAt
        };
    } catch (error) {
        console.error('Error fetching assessment:', error);
        return null;
    }
}

// Add new assessment
async function addAssessment(data) {
    try {
        // Find or create user
        let user = await User.findOne({ username: data.username });
        if (!user) {
            user = new User({ username: data.username });
            await user.save();
        }

        // Find or create website
        let website = await Website.findOne({ url: data.websiteUrl });
        if (!website) {
            website = new Website({
                name: data.websiteName,
                url: data.websiteUrl,
                imageUrl: data.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'
            });
            await website.save();
        }

        // Create review
        const review = new Review({
            user: user._id,
            website: website._id,
            score: parseInt(data.score) || 3,
            assessment: data.assessment,
            criteriaChecked: data.criteriaChecked ? data.criteriaChecked.split(',').map(c => c.trim()).filter(c => c) : []
        });

        await review.save();
        
        return {
            id: review._id,
            websiteName: website.name,
            websiteUrl: website.url,
            imageUrl: website.imageUrl,
            assessment: review.assessment,
            score: review.score,
            username: user.username,
            criteriaChecked: review.criteriaChecked
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

