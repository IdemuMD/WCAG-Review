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
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    assessment: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    criteriaChecked: [{
        type: String,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient queries
reviewSchema.index({ website: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// Virtual for formatted score
reviewSchema.virtual('scoreFormatted').get(function() {
    return `${this.score}/5`;
});

reviewSchema.set('toJSON', { virtuals: true });
reviewSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema);

