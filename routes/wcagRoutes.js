const express = require('express');
const router = express.Router();
const wcagController = require('../controllers/wcagController');

// Route for the main WCAG assessment page
router.get('/', (req, res) => {
    const assessments = wcagController.getAllAssessments();
    res.render('index', { assessments });
});

// Route for individual assessment (optional)
router.get('/assessment/:id', (req, res) => {
    const assessment = wcagController.getAssessmentById(req.params.id);
    if (assessment) {
        res.render('index', { assessments: [assessment] });
    } else {
        res.status(404).send('Vurdering ikke funnet');
    }
});

module.exports = router;

