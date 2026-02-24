const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const wcagController = require('../controllers/wcagController');

// Login page
router.get('/login', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('login', { error: null });
});

// Register page
router.get('/register', (req, res) => {
    if (req.session.userId) {
        return res.redirect('/');
    }
    res.render('register', { error: null });
});

// Login POST
router.post('/login', authController.login);

// Register POST
router.post('/register', authController.register);

// Logout
router.get('/logout', authController.logout);

// Main page - list all assessments
router.get('/', async (req, res) => {
    try {
        const assessments = await wcagController.getAllAssessments();
        const user = req.session.username ? { username: req.session.username } : null;
        res.render('index', { assessments, user });
    } catch (error) {
        console.error('Error in GET /:', error);
        res.status(500).send('Feil ved henting av vurderinger');
    }
});

// Add assessment form (requires login)
router.get('/add', authController.isAuthenticated, (req, res) => {
    res.render('add', { user: { username: req.session.username } });
});

// Add assessment POST (requires login)
router.post('/add', authController.isAuthenticated, async (req, res) => {
    try {
        await wcagController.addAssessment(req.body, req.session.userId);
        res.redirect('/');
    } catch (error) {
        console.error('Error in POST /add:', error);
        res.status(500).send('Feil ved lagring av vurdering');
    }
});

// Individual assessment view
router.get('/assessment/:id', async (req, res) => {
    try {
        const assessment = await wcagController.getAssessmentById(req.params.id);
        const user = req.session.username ? { username: req.session.username } : null;
        if (assessment) {
            res.render('index', { assessments: [assessment], user });
        } else {
            res.status(404).send('Vurdering ikke funnet');
        }
    } catch (error) {
        console.error('Error in GET /assessment/:id:', error);
        res.status(500).send('Feil ved henting av vurdering');
    }
});

module.exports = router;

