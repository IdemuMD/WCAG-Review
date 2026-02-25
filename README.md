# WCAG-Review

WCAG-Review is a web application for reviewing websites for WCAG (Web Content Accessibility Guidelines) compliance.

## Endret konfigurasjon

### MongoDB
- **IP**: `10.12.2.180`
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

Serveren starter på http://localhost:3000

## Administrator

For å opprette en admin-bruker, kjør scriptet:

```bash
node create-admin.js
```

**Standard admin-bruker:**
- **Username**: admin
- **Password**: admin123 (bytt dette etter første pålogging!)

## Autorisering og autentisering

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

## .gitignore

Lagt til i .gitignore for å unngå å lagre sensitive filer:
- cookies*.txt
- session.json

