# Neon Database Setup

## Umgebungsvariablen einrichten

Erstellen Sie eine `.env.local` Datei im Projektverzeichnis mit folgenden Inhalten:

```env
# Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_1sM6yrnZBNOd@ep-autumn-meadow-adz8cn83-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Neon Auth (optional for future features)
NEXT_PUBLIC_STACK_PROJECT_ID=29346fb8-acb4-44fe-99e2-5128ba5c2a94
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_m7aqfa8bdyvv08q86sjjfwmp9zeryw82texv1a0w8n480
STACK_SECRET_SERVER_KEY=ssk_mgc0s27gwgvfj3x8j1zafvqabatzh213hmn0fw987dvzr
```

## Datenbank initialisieren

Nach dem Starten der Anwendung werden die Tabellen automatisch erstellt. Die SQL-Schema-Datei befindet sich in `src/lib/schema.sql`.

## Features

✅ **Implementiert:**
- Neon PostgreSQL-Datenbank
- NextAuth.js Authentifizierung
- Registrierung und Login
- Session-Management
- Datenbank-Schema für Habits, Users, etc.

🔄 **In Entwicklung:**
- Habit-Management mit Datenbank
- Profil-Dropdown mit Logout
- Share-Code System für Freunde

## Nächste Schritte

1. `.env.local` mit den obigen Werten erstellen
2. `npm run dev` ausführen
3. Registrierung testen
4. Habit-Tracking implementieren
