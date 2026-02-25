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

## Dependencies

- express - Web framework
- mongoose - MongoDB ODM
- ejs - Template engine
- express-session - Session management
- bcryptjs - Password hashing

## .gitignore

Lagt til i .gitignore for å unngå å lagre sensitive filer:
- session.json

