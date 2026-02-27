# WCAG-Review

WCAG-Review is a web application for reviewing websites for WCAG (Web Content Accessibility Guidelines) compliance.

## Endret konfigurasjon

### MongoDB
- **IP**: `10.12.2.181`
- **Port**: `27017`
- **Database**: `wcag_reviews`

### Webserver
- **IP**: `10.12.2.186`
- **Port**: `3000` (standard)

## Installering

```bash
npm install
```

## Kjøring

```bash
npm start
```

Serveren starter på http://10.12.2.186:3000 eller http://wcag.skynet.ikt-fag.no:3000/

## Administrator

For å opprette en admin-bruker, kjør scriptet:

```bash
node create-admin.js
```

**Standard admin-bruker:**
- **Username**: admin
- **Password**: admin123 (bytt dette etter første pålogging!)

### Autentisering (Authentication)
Autentisering bekrefter brukerens identitet. I denne applikasjonen brukes:

1. **Session-based auth**: Brukeren logger inn med brukernavn og passord
2. **Passord-hashing**: Alle passord lagres kryptert med bcryptjs
3. **Session cookies**: Logger brukeren inn automatisk ved neste besøk

### Autorisasjon (Authorization)
Autorisasjon bestemmer hva en autentisert bruker får tilgang til:

1. **Roller**: Brukere har roller som `user` eller `admin`
2. **Beskyttede ruter**: Kun innloggede brukere kan:
   - Legge til nye vurderinger
   - Stemme på vurderinger
   - Rapportere vurderinger
3. **Admin-spesifikke ruter**: Kun admin kan:
   - Vise og behandle rapporter (/admin/reports)
   - Slette vurderinger (/admin/delete-review/:id)
   - Slette nettsider (/admin/delete-website/:id)

### Implementasjon

**Middleware for autentisering:**
```javascript
// Sjekker om bruker er logget inn
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}
```

**Middleware for autorisasjon (admin):**
```javascript
// Sjekker om bruker er admin
async function isAdmin(req, res, next) {
    const user = await User.findById(req.session.userId);
    if (user.role !== 'admin') {
        return res.status(403).send('Tilgang nektet');
    }
    next();
}
```

### Sikkerhetsfunksjoner
- Passord hashing med bcryptjs (salt + hash)
- Session-basert autentisering
- Server-side validering av alle input
- Beskyttede admin-ruter

## Dependencies

- express - Web framework
- mongoose - MongoDB ODM
- ejs - Template engine
- express-session - Session management
- bcryptjs - Password hashing

---

## Admin-funksjoner

Administratorer har tilgang til spesielle funksjoner for å administrere rapporter og innhold. Her er en detaljert gjennomgang av admin-funksjonene:

### isAdmin Middleware (Linje 160-178 i routes/wcagRoutes.js)

```javascript
// Admin routes - simple admin check
async function isAdmin(req, res, next) {
    try {
        // Linje 163-165: Sjekker om bruker er logget inn
        if (!req.session.userId) {
            return res.redirect('/login');
        }
        
        // Linje 167-168: Importerer User-modellen og henter bruker fra database
        const User = require('../models/User');
        const user = await User.findById(req.session.userId);
        
        // Linje 170-173: Sjekker om brukeren har admin-rolle
        if (!user || user.role !== 'admin') {
            return res.status(403).send('Tilgang nektet. Kun administratorer har tilgang til denne siden.');
        }
        
        // Linje 175-177: Legger til brukerinfo i request-objektet og går videre
        req.user = user;
        req.userWithRole = { username: user.username, role: user.role };
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).send('Serverfeil');
    }
}
```

**Forklaring:**
- **Linje 163-165**: Først sjekkes det om brukeren er logget inn ved å se på `req.session.userId`. Hvis ikke, omdirigeres brukeren til login-siden.
- **Linje 167-168**: User-modellen importeres og brukeren hentes fra databasen basert på session-ID.
- **Linje 170-173**: Det sjekkes om brukeren eksisterer og har rollen 'admin'. Hvis ikke, returneres en 403-feil.
- **Linje 175-177**: Brukerinformasjon lagres i request-objektet og `next()` kalles for å fortsette til neste middleware/route handler.

### Admin - Slette Vurdering (Linje 217-229 i routes/wcagRoutes.js)

```javascript
// Admin - delete a review (also resolves associated reports)
router.post('/admin/delete-review/:id', isAdmin, async (req, res) => {
    try {
        // Linje 220: Sletter vurdering og løser tilknyttede rapporter
        await wcagController.deleteReviewWithReportResolution(req.params.id, req.session.userId);
        
        // Linje 223-225: Bestemmer redirect-URL etter sletting
        const redirectUrl = req.query.redirect || '/admin/reports';
        res.redirect(`${redirectUrl}?deleted=true`);
    } catch (error) {
        console.error('Error in POST /admin/delete-review/:id:', error);
        res.status(500).send('Feil ved sletting av vurdering: ' + error.message);
    }
});
```

**Forklaring:**
- **Linje 217**: Route for POST-forespørsel med `:id` parameter for vurderings-ID
- **Linje 218**: `isAdmin` middleware beskytter ruten - kun admins kan slette
- **Linje 220**: Kaller controller-funksjonen som sletter vurderingen og løser tilknyttede rapporter automatisk
- **Linje 223-225**: Returnerer brukeren tilbake til reports-siden med `deleted=true` parameter

### Admin - Slette Nettside (Linje 231-241 i routes/wcagRoutes.js)

```javascript
// Admin - delete a website and all its reviews
router.post('/admin/delete-website/:id', isAdmin, async (req, res) => {
    try {
        // Linje 234: Sletter nettside og alle tilknyttede vurderinger
        await wcagController.deleteWebsite(req.params.id);
        res.redirect('/?deleted=true');
    } catch (error) {
        console.error('Error in POST /admin/delete-website/:id:', error);
        res.status(500).send('Feil ved sletting av nettside: ' + error.message);
    }
});
```

**Forklaring:**
- **Linje 231**: Route for POST-forespørsel med `:id` parameter for nettside-ID
- **Linje 234**: Sletter nettsiden og ALLE tilknyttede vurderinger (ikke bare én)

---

## Report-funksjoner (Rapporteringssystem)

Brukere kan rapportere vurderinger som er upassende. Her er en detaljert gjennomgang:

### Opprette Rapport (Linje 1-53 i controllers/reportController.js)

```javascript
// Create a new report
async function createReport(data, userId) {
    try {
        // Linje 6-8: Validér at review-ID er til stede
        if (!data.reviewId) {
            throw new Error('Review-ID er påkrevd');
        }
        
        // Linje 10-12: Validér at rapporteringsårsak er valgt
        if (!data.reason) {
            throw new Error('Rapportårsak er påkrevd');
        }
        
        // Linje 15-19: Sjekk at vurderingen faktisk eksisterer
        const review = await Review.findById(data.reviewId);
        if (!review) {
            throw new Error('Vurdering ikke funnet');
        }
        
        // Linje 22-28: Forhindre at samme bruker rapporterer samme vurdering flere ganger
        const existingReport = await Report.findOne({
            review: data.reviewId,
            reporter: userId
        });
        
        if (existingReport) {
            throw new Error('Du har allerede rapportert denne vurderingen');
        }
        
        // Linje 31-37: Opprett ny rapport med data
        const report = new Report({
            review: data.reviewId,
            reporter: userId,
            reason: data.reason,
            comment: data.comment || ''
        });
        
        // Linje 39-40: Lagre rapporten i databasen
        await report.save();
        
        return { success: true, message: 'Rapport sendt inn successfully' };
    } catch (error) {
        console.error('Error creating report:', error);
        throw error;
    }
}
```

**Forklaring:**
- **Linje 6-8**: Første validering - sjekker at review-ID er sendt med
- **Linje 10-12**: Sjekker at brukeren har valgt en årsak (reason)
- **Linje 15-19**: Henter vurderingen fra databasen for å bekrefte at den eksisterer
- **Linje 22-28**: Sjekker om brukeren allerede har rapportert denne vurderingen - forhindrer duplikatrapporter
- **Linje 31-37**: Oppretter nytt Report-objekt med:
  - `review`: Referanse til vurderingen som rapporteres
  - `reporter`: Brukeren som rapporterer
  - `reason`: Årsak (inappropriate, incorrect, spam, other)
  - `comment`: Valgfri kommentar
- **Linje 39-40**: Lagrer rapporten i MongoDB

### Rapporteringsårsaker (Linje 1-23 i models/Report.js)

```javascript
const reportSchema = new mongoose.Schema({
    // ...
    reason: {
        type: String,
        required: true,
        enum: ['inappropriate', 'incorrect', 'spam', 'other'],  // Linje 13-14: Gyldige årsaker
        default: 'other'
    },
    // ...
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],   // Linje 20-21: Rapportstatuser
        default: 'pending'
    },
    // ...
});
```

**Forklaring:**
- **Linje 13-14**: Fire mulige rapporteringsårsaker:
  - `inappropriate`: Upassende innhold
  - `incorrect`: Feilaktig informasjon
  - `spam`: Reklame/søppelpost
  - `other`: Annen årsak
- **Linje 20-21**: Fire mulige statuser:
  - `pending`: Avventer behandling
  - `reviewed`: Er under behandling
  - `resolved`: Er løst (vurdering slettet eller rettet)
  - `dismissed`: Avvist (rapporteringen var uberettiget)

---

## Assessment-funksjoner (Vurderinger)

Vurderinger er hovedinnholdet i applikasjonen - brukere legger til WCAG-vurderinger av nettsider.

### Hente Alle Vurderinger (Linje 4-60 i controllers/wcagController.js)

```javascript
// Get all reviews with user and website info
async function getAllAssessments(userId = null, searchQuery = '', sortBy = 'popular') {
    try {
        let query = {};
        
        // Linje 11-17: Søkefunksjon - søker i nettsidenavn, URL, vurdering og brukernavn
        if (searchQuery) {
            const regex = new RegExp(searchQuery, 'i');
            query.$or = [
                { 'website.name': regex },
                { 'website.url': regex },
                { assessment: regex },
                { 'user.username': regex }
            ];
        }
        
        // Linje 19-28: Sorteringsalternativer
        let sortOption = {};
        switch (sortBy) {
            case 'score':
                sortOption = { score: -1 };          // Høyest score først
                break;
            case 'newest':
                sortOption = { createdAt: -1 };      // Nyeste først
                break;
            case 'popular':
            default:
                sortOption = { upvotes: -1, downvotes: 1, createdAt: -1 };  // Flest stemmer først
        }
        
        // Linje 30-34: Hent vurderinger fra database med populate
        const reviews = await Review.find(query)
            .populate('user', 'username')
            .populate('website', 'name url imageUrl')
            .sort(sortOption)
            .lean();
        
        // Linje 36-52: Transformér data og inkluder brukerens stemme
        return reviews.map(review => {
            let userVote = null;
            if (userId) {
                const existingVote = review.votedBy.find(v => v.user && v.user.toString() === userId.toString());
                if (existingVote) {
                    userVote = existingVote.vote;
                }
            }
            
            return {
                id: review._id,
                websiteName: review.website.name,
                websiteUrl: review.website.url,
                imageUrl: review.website.imageUrl,
                assessment: review.assessment,
                score: review.score,
                username: review.user.username,
                userId: review.user._id,
                criteriaChecked: review.criteriaChecked || [],
                createdAt: review.createdAt,
                upvotes: review.upvotes,
                downvotes: review.downvotes,
                totalVotes: review.upvotes - review.downvotes,
                userVote: userVote,
                wave: review.wave || { errors: 0, alerts: 0, features: 0, structuralElements: 0, html5AndARIA: 0 }
            };
        });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return [];
    }
}
```

**Forklaring:**
- **Linje 11-17**: Søk bruker Regex for å finne vurderinger som matcher søkeordet i flere felt
- **Linje 19-28**: Tre sorteringsmoduser:
  - `score`: Sorterer etter WCAG-score (0-100)
  - `newest`: Sorterer etter opprettelsesdato
  - `popular` (standard): Sorterer etter popularitet ( upvotes - downvotes)
- **Linje 30-34**: Bruker Mongoose `populate()` for å hente tilknyttet data fra andre collections
- **Linje 36-52**: Transformerer MongoDB-dokumenter til rene JavaScript-objekter med beregnede felt

### Legge til Ny Vurdering (Linje 81-161 i controllers/wcagController.js)

```javascript
// Add new assessment (requires authenticated user)
async function addAssessment(data, userId) {
    try {
        // Linje 85-90: Validér bruker-ID
        if (!userId) {
            throw new Error('Bruker er ikke logget inn');
        }
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Ugyldig bruker-ID');
        }
        
        // Linje 93-98: Validér nettsidenavn (minimum 2 tegn)
        const websiteName = data.websiteName ? data.websiteName.trim() : '';
        const websiteUrl = data.websiteUrl ? data.websiteUrl.trim() : '';
        
        if (!websiteName || websiteName.length < 2) {
            throw new Error('Nettstedsnavn må være minst 2 tegn');
        }
        
        // Linje 100-102: Validér at URL er oppgitt
        if (!websiteUrl) {
            throw new Error('Nettsteds-URL er påkrevd');
        }
        
        // Linje 105-109: Validér score (må være mellom 0 og 100)
        const score = parseInt(data.score) || 100;
        if (score < 0 || score > 100) {
            throw new Error('Score må være mellom 0 og 100');
        }
        
        // Linje 112-119: Validér vurderingstekst (minimum 10 tegn)
        if (!data.assessment || data.assessment.trim().length === 0) {
            throw new Error('Vurderingsteksten er påkrevd');
        }
        
        if (data.assessment.trim().length < 10) {
            throw new Error('Vurderingsteksten må være minst 10 tegn');
        }
        
        // Linje 122-131: Finn eksisterende nettside eller opprett ny
        let website = await Website.findOne({ url: websiteUrl });
        if (!website) {
            const screenshotUrl = `https://image.thum.io/get/width/1200/crop/675/${encodeURIComponent(websiteUrl)}`;
            
            website = new Website({
                name: websiteName,
                url: websiteUrl,
                imageUrl: screenshotUrl
            });
            await website.save();
        }
        
        // Linje 134-140: Behandle valgfrie WCAG-kriterier
        let criteriaChecked = [];
        if (data.criteriaChecked && typeof data.criteriaChecked === 'string') {
            criteriaChecked = data.criteriaChecked.split(',').map(c => c.trim()).filter(c => c);
        }
        
        // Linje 143-160: Opprett og lagre ny vurdering
        const review = new Review({
            user: userId,
            website: website._id,
            score: score,
            assessment: data.assessment,
            criteriaChecked: criteriaChecked,
            wave: {
                errors: parseInt(data.waveErrors) || 0,
                alerts: parseInt(data.waveAlerts) || 0,
                features: parseInt(data.waveFeatures) || 0,
                structuralElements: parseInt(data.waveStructural) || 0,
                html5AndARIA: parseInt(data.waveARIA) || 0,
                rawResults: { /* ... */ },
                evaluatedAt: new Date()
            }
        });

        await review.save();
        
        // Linje 162-173: Returner fullstendig vurderingsobjekt
        return { /* ... */ };
    } catch (error) {
        console.error('Error adding assessment:', error);
        throw error;
    }
}
```

**Forklaring:**
- **Linje 85-90**: Server-side validering av brukerens autentisering
- **Linje 93-98**: Validér at nettsidenavn er minst 2 tegn
- **Linje 100-102**: URL er påkrevd - ellers kan man ikke vurdere noe
- **Linje 105-109**: WCAG-score må være mellom 0 (dårligst) og 100 (best)
- **Linje 112-119**: Vurderingsteksten må være meningsfull (minst 10 tegn)
- **Linje 122-131**: Unngå duplikater - hvis nettsiden allerede eksisterer, bruk den; ellers opprett ny
- **Linje 134-140**: Prosesserer WCAG-kriterier som er avkrysset (f.eks. "1.1.1, 1.4.3, 2.4.4")
- **Linje 143-160**: Inkluderer WAVE-analyse data (feil, advarsler, funksjoner, strukturelle elementer, ARIA)

---

## Autentisering og Autorisasjon (Oversikt)

### User-modellen (models/User.js)

```javascript
const userSchema = new mongoose.Schema({
    // ...
    role: {
        type: String,
        enum: ['user', 'admin'],      // Linje 13-14: To roller i systemet
        default: 'user'
    },
    // ...
});

// Linje 22-24: Passord-hashing med bcrypt
userSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);      // Genererer salt
    this.password = await bcrypt.hash(this.password, salt);  // Hash passordet
});

// Linje 27-29: Metode for å sjekke passord
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
```

**Forklaring:**
- **Linje 13-14**: Brukere har én av to roller: `user` (standard) eller `admin`
- **Linje 22-24**: Før passord lagres, hashes det med bcrypt (salt + hash) for sikker lagring
- **Linje 27-29**: Ved innlogging sammenlignes det hashede passordet med brukerens input

### Session-basert Autentisering (controllers/authController.js)

```javascript
// Linje 25-35: Login-funksjon
async function login(req, res) {
    // Linje 29-33: Finn bruker og sjekk passord
    const user = await User.findOne({ username });
    const isMatch = await user.comparePassword(password);
    
    // Linje 35-39: Opprett session ved vellykket innlogging
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.userRole = user.role;           // Lagre rolle i session
}
```

**Forklaring:**
- **Linje 29-33**: Brukeren hentes fra databasen og passordet sjekkes
- **Linje 35-39**: Ved vellykket innlogging opprettes en session med:
  - `userId`: Unik ID for å identifisere brukeren
  - `username`: Vist navn
  - `userRole`: Brukerens rolle (brukes for autorisasjonssjekk)

---

## Database-relasjoner

### Review-modellen (referanse)

Vurderinger er knyttet til:
- **User**: `user` (ref: 'User') - hvem som laget vurderingen
- **Website**: `website` (ref: 'Website') - hvilken nettside som vurderes
- **Reports**: `reports` (via review-feltet) - alle rapporter på denne vurderingen

### Report-modellen

Rapporter er knyttet til:
- **Review**: `review` (ref: 'Review') - vurderingen som rapporteres
- **User** (reporter): `reporter` (ref: 'User') - hvem som rapporterte
- **User** (reviewer): `reviewedBy` (ref: 'User') - admin som behandlet rapporten

