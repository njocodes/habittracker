# Habit Tracker

Eine moderne, intuitive Habit-Tracking-App mit Next.js, TypeScript und Neon PostgreSQL.

## Features

- ✅ **Benutzerregistrierung & Anmeldung** mit NextAuth.js
- ✅ **Habit-Management** mit vollständiger CRUD-Funktionalität
- ✅ **Kalenderansicht** mit Farbkodierung für Fortschritte
- ✅ **Swipe-Gesten** für mobile Navigation
- ✅ **Share Code System** für Freunde
- ✅ **Umfassende Einstellungen** (Profil, Benachrichtigungen, Erscheinungsbild, Datenschutz)
- ✅ **Vercel Analytics** Integration
- ✅ **Responsive Design** mit Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Datenbank**: Neon PostgreSQL
- **Authentifizierung**: NextAuth.js
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics

## Lokale Entwicklung

1. **Repository klonen**
   ```bash
   git clone https://github.com/njocodes/habittracker.git
   cd habittracker
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Umgebungsvariablen einrichten**
   Erstellen Sie eine `.env.local` Datei mit:
   ```env
   DATABASE_URL=your_neon_database_url
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key
   ```

4. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

## Deployment

Die App ist auf [habits.njo.codes](https://habits.njo.codes) verfügbar.

## Sicherheit

- Alle sensiblen Daten werden über Umgebungsvariablen verwaltet
- Passwörter werden mit bcrypt gehashed
- JWT-basierte Authentifizierung
- SQL-Injection Schutz durch parametrisierte Queries

## Lizenz

MIT License