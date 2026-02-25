const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: true
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: ['inappropriate', 'incorrect', 'spam', 'other'],
        default: 'other'
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewComment: {
        type: String,
        trim: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
reportSchema.pre('save', async function() {
    this.updatedAt = new Date();
});

// Index for efficient queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ review: 1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;

