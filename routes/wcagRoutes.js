const express = require('express');
const router = express.Router();
const wcagController = require('../controllers/wcagController');

// Route for the main WCAG assessment page (list)
router.get('/', async (req, res) => {
    try {
        const assessments = await wcagController.getAllAssessments();
        res.render('index', { assessments });
    } catch (error) {
        console.error('Error in GET /:', error);
        res.status(500).send('Feil ved henting av vurderinger');
    }
});

// Route for the add assessment form page
router.get('/add', (req, res) => {
    res.render('add');
});

// Route to handle form submission
router.post('/add', async (req, res) => {
    try {
        await wcagController.addAssessment(req.body);
        res.redirect('/');
    } catch (error) {
        console.error('Error in POST /add:', error);
        res.status(500).send('Feil ved lagring av vurdering');
    }
});

// Route for individual assessment (optional)
router.get('/assessment/:id', async (req, res) => {
    try {
        const assessment = await wcagController.getAssessmentById(req.params.id);
        if (assessment) {
            res.render('index', { assessments: [assessment] });
        } else {
            res.status(404).send('Vurdering ikke funnet');
        }
    } catch (error) {
        console.error('Error in GET /assessment/:id:', error);
        res.status(500).send('Feil ved henting av vurdering');
    }
});

module.exports = router;

