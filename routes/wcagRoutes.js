
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const wcagController = require('../controllers/wcagController');
const voteController = require('../controllers/voteController');

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

// Help page
router.get('/help', (req, res) => {
    const user = req.session.username ? { username: req.session.username } : null;
    res.render('help', { user });
});

// Main page - list all assessments with search and sort
router.get('/', async (req, res) => {
    try {
        const userId = req.session.userId || null;
        const searchQuery = req.query.q || '';
        const sortBy = req.query.sort || 'popular'; // popular, score, newest
        
        const assessments = await wcagController.getAllAssessments(userId, searchQuery, sortBy);
        const user = req.session.username ? { username: req.session.username } : null;
        
        res.render('index', { 
            assessments, 
            user,
            searchQuery,
            sortBy
        });
    } catch (error) {
        console.error('Error in GET /:', error);
        res.status(500).send('Feil ved henting av vurderinger');
    }
});

// Search results
router.get('/search', async (req, res) => {
    try {
        const userId = req.session.userId || null;
        const searchQuery = req.query.q || '';
        const sortBy = req.query.sort || 'popular';
        
        const assessments = await wcagController.getAllAssessments(userId, searchQuery, sortBy);
        const user = req.session.username ? { username: req.session.username } : null;
        
        res.render('index', { 
            assessments, 
            user,
            searchQuery,
            sortBy
        });
    } catch (error) {
        console.error('Error in GET /search:', error);
        res.status(500).send('Feil ved søk');
    }
});

// Add assessment form (requires login)
router.get('/add', authController.isAuthenticated, (req, res) => {
    res.render('add', { user: { username: req.session.username } });
});

// Add assessment POST (requires login)
router.post('/add', authController.isAuthenticated, async (req, res) => {
    try {
        const result = await wcagController.addAssessment(req.body, req.session.userId);
        res.redirect('/');
    } catch (error) {
        console.error('Error in POST /add:', error);
        
        // Provide user-friendly error messages
        let errorMessage = error.message;
        
        if (errorMessage.includes('Vurderingsteksten er påkrevd')) {
            errorMessage = 'Vurderingsteksten er påkrevd. Vennligst skriv en vurdering.';
        } else if (errorMessage.includes('Vurderingsteksten må være minst 10 tegn')) {
            errorMessage = 'Vurderingsteksten må være minst 10 tegn. Vennligst skriv en mer detaljert vurdering.';
        } else if (errorMessage.includes('Nettstedsnavn må være minst 2 tegn')) {
            errorMessage = 'Nettstedsnavn må være minst 2 tegn. Vennligt fyll inn et gyldig navn.';
        } else if (errorMessage.includes('Nettsteds-URL er påkrevd')) {
            errorMessage = 'Nettsteds-URL er påkrevd. Vennligst fyll inn en gyldig URL.';
        } else if (errorMessage.includes('Score må være mellom 0 og 100')) {
            errorMessage = 'Score må være mellom 0 og 100.';
        } else if (errorMessage.includes('Bruker er ikke logget inn')) {
            errorMessage = 'Du må være logget inn for å legge til en vurdering.';
        } else if (error.name === 'ValidationError') {
            // Handle other validation errors from Mongoose
            const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message);
            errorMessage = 'Valideringsfeil: ' + validationErrors.join(', ');
        }
        
        res.status(500).send(`Feil ved lagring av vurdering: ${errorMessage}`);
    }
});

// Vote on a review (requires login, AJAX)
router.post('/vote/:reviewId', authController.isAuthenticated, voteController.vote);

// Individual assessment view - dedicated page
router.get('/assessment/:id', async (req, res) => {
    try {
        const userId = req.session.userId || null;
        const assessment = await wcagController.getAssessmentById(req.params.id, userId);
        const user = req.session.username ? { username: req.session.username } : null;
        if (assessment) {
            res.render('assessment', { assessment, user });
        } else {
            res.status(404).send('Vurdering ikke funnet');
        }
    } catch (error) {
        console.error('Error in GET /assessment/:id:', error);
        res.status(500).send('Feil ved henting av vurdering');
    }
});

module.exports = router;

