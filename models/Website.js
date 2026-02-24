const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true,
        default: 'https://via.placeholder.com/600x400?text=No+Image'
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for searching
websiteSchema.index({ name: 'text', url: 'text' });

module.exports = mongoose.model('Website', websiteSchema);

