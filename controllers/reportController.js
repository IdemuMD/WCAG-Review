const Report = require('../models/Report');
const Review = require('../models/Review');
const User = require('../models/User');

// Create a new report
async function createReport(data, userId) {
    try {
        // Validate required fields
        if (!data.reviewId) {
            throw new Error('Review-ID er påkrevd');
        }
        
        if (!data.reason) {
            throw new Error('Rapportårsak er påkrevd');
        }
        
        // Check if review exists
        const review = await Review.findById(data.reviewId);
        if (!review) {
            throw new Error('Vurdering ikke funnet');
        }
        
        // Check if user already reported this review
        const existingReport = await Report.findOne({
            review: data.reviewId,
            reporter: userId
        });
        
        if (existingReport) {
            throw new Error('Du har allerede rapportert denne vurderingen');
        }
        
        // Create report
        const report = new Report({
            review: data.reviewId,
            reporter: userId,
            reason: data.reason,
            comment: data.comment || ''
        });
        
        await report.save();
        
        return {
            success: true,
            message: 'Rapport sendt inn successfully'
        };
    } catch (error) {
        console.error('Error creating report:', error);
        throw error;
    }
}

// Get all reports (for admin)
async function getAllReports(status = null) {
    try {
        let query = {};
        
        if (status) {
            query.status = status;
        }
        
        const reports = await Report.find(query)
            .populate('review')
            .populate('reporter', 'username')
            .populate('reviewedBy', 'username')
            .sort({ createdAt: -1 })
            .lean();
        
        return reports.map(report => ({
            id: report._id,
            reviewId: report.review ? report.review._id : null,
            reviewAssessment: report.review ? report.review.assessment : 'Vurdering slettet',
            reviewWebsite: report.review ? report.review.website : null,
            reporterUsername: report.reporter ? report.reporter.username : 'Ukjent',
            reason: report.reason,
            comment: report.comment,
            status: report.status,
            reviewedBy: report.reviewedBy ? report.reviewedBy.username : null,
            reviewComment: report.reviewComment,
            createdAt: report.createdAt
        }));
    } catch (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
}

// Get report by ID
async function getReportById(id) {
    try {
        const report = await Report.findById(id)
            .populate('review')
            .populate('reporter', 'username')
            .populate('reviewedBy', 'username')
            .lean();
        
        if (!report) return null;
        
        return {
            id: report._id,
            reviewId: report.review ? report.review._id : null,
            reviewAssessment: report.review ? report.review.assessment : 'Vurdering slettet',
            reviewWebsite: report.review ? report.review.website : null,
            reporterUsername: report.reporter ? report.reporter.username : 'Ukjent',
            reason: report.reason,
            comment: report.comment,
            status: report.status,
            reviewedBy: report.reviewedBy ? report.reviewedBy.username : null,
            reviewComment: report.reviewComment,
            createdAt: report.createdAt
        };
    } catch (error) {
        console.error('Error fetching report:', error);
        return null;
    }
}

// Update report status (for admin)
async function updateReportStatus(reportId, status, reviewComment, adminUserId) {
    try {
        const report = await Report.findById(reportId);
        
        if (!report) {
            throw new Error('Rapport ikke funnet');
        }
        
        report.status = status;
        report.reviewedBy = adminUserId;
        
        if (reviewComment) {
            report.reviewComment = reviewComment;
        }
        
        await report.save();
        
        // If report is resolved, optionally delete the review
        if (status === 'resolved') {
            // You could delete the review here if needed
            // await Review.findByIdAndDelete(report.review);
        }
        
        return {
            success: true,
            message: 'Rapport oppdatert'
        };
    } catch (error) {
        console.error('Error updating report:', error);
        throw error;
    }
}

// Get report count by status
async function getReportCounts() {
    try {
        const pending = await Report.countDocuments({ status: 'pending' });
        const reviewed = await Report.countDocuments({ status: 'reviewed' });
        const resolved = await Report.countDocuments({ status: 'resolved' });
        const dismissed = await Report.countDocuments({ status: 'dismissed' });
        
        return {
            pending,
            reviewed,
            resolved,
            dismissed,
            total: pending + reviewed + resolved + dismissed
        };
    } catch (error) {
        console.error('Error getting report counts:', error);
        return { pending: 0, reviewed: 0, resolved: 0, dismissed: 0, total: 0 };
    }
}

module.exports = {
    createReport,
    getAllReports,
    getReportById,
    updateReportStatus,
    getReportCounts
};

