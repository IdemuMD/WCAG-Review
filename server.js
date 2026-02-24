const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/database');
const wcagRoutes = require('./routes/wcagRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'wcag-review-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true
    }
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Make user available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.username ? { username: req.session.username } : null;
    next();
});

// Connect to MongoDB and start server
async function startServer() {
    try {
        await connectDB();
        
        // Use routes
        app.use('/', wcagRoutes);
        
        // Start server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

