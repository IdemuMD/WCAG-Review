const express = require('express');
const router = express.Router();
const wcagController = require('../controllers/wcagController');

// Route for the main WCAG assessment page (list)
router.get('/', (req, res) => {
    const assessments = wcagController.getAllAssessments();
    res.render('index', { assessments });
});

// Route for the add assessment form page
router.get('/add', (req, res) => {
    res.render('add');
});

// Route to handle form submission
router.post('/add', (req, res) => {
    wcagController.addAssessment(req.body);
    res.redirect('/');
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

