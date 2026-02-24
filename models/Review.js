const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    website: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Website',
        required: true
    },
    // WAVE Score (calculated from WAVE evaluation)
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    assessment: {
        type: String,
        required: true,
        trim: true
    },
    criteriaChecked: [{
        type: String,
        trim: true
    }],
    // WAVE Evaluation Results
    wave: {
        errors: {
            type: Number,
            default: 0
        },
        alerts: {
            type: Number,
            default: 0
        },
        features: {
            type: Number,
            default: 0
        },
        structuralElements: {
            type: Number,
            default: 0
        },
        html5AndARIA: {
            type: Number,
            default: 0
        },
        // Raw WAVE results as JSON for reference
        rawResults: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        evaluatedAt: {
            type: Date,
            default: Date.now
        }
    },
    upvotes: {
        type: Number,
        default: 0
    },
    downvotes: {
        type: Number,
        default: 0
    },
    votedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        vote: {
            type: String,
            enum: ['up', 'down']
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient queries
reviewSchema.index({ website: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ upvotes: -1, downvotes: -1, createdAt: -1 });

// Virtual for total score
reviewSchema.virtual('totalVotes').get(function() {
    return this.upvotes - this.downvotes;
});

// Virtual for formatted score
reviewSchema.virtual('scoreFormatted').get(function() {
    return `${this.score}/5`;
});

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);

