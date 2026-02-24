const User = require('../models/User');
const Review = require('../models/Review');
const Website = require('../models/Website');

// Register new user
async function register(req, res) {
    try {
        const { username, password, confirmPassword } = req.body;
        
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.render('register', { error: 'Passordene er ikke like' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('register', { error: 'Brukernavn er allerede tatt' });
        }
        
        // Create new user
        const user = new User({ username, password });
        await user.save();
        
        // Set session
        req.session.userId = user._id;
        req.session.username = user.username;
        
        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { error: 'Feil ved registrering' });
    }
}

// Login user
async function login(req, res) {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('login', { error: 'Feil brukernavn eller passord' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('login', { error: 'Feil brukernavn eller passord' });
        }
        
        // Set session
        req.session.userId = user._id;
        req.session.username = user.username;
        
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'Feil ved innlogging' });
    }
}

// Logout user
function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
}

// Check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

// Get current user
function getCurrentUser(req) {
    return {
        id: req.session.userId,
        username: req.session.username
    };
}

module.exports = {
    register,
    login,
    logout,
    isAuthenticated,
    getCurrentUser
};

