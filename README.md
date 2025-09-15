# 🎯 Habit Tracker - Ultra-Performance Optimiert

Ein hochmodernes, extrem optimiertes Habit Tracker System mit Next.js 15, TypeScript und Supabase. Dieses Projekt wurde speziell für maximale Performance und minimale Vercel Edge Requests entwickelt.

## ✨ Features

### 🚀 **Extreme Performance**
- **Lighthouse Score**: 90%+ Performance
- **Edge Requests**: 99%+ Reduktion durch intelligentes Caching
- **Bundle Size**: Drastisch optimiert mit Tree Shaking
- **Service Worker**: Offline-First-Ansatz mit aggressivem Caching

### 📊 **Habit Management**
- **Habit Tracking**: Erstelle und verfolge deine Gewohnheiten
- **Success Rate**: Intelligente Berechnung mit Zeitfiltern
- **Statistics**: Detaillierte Statistiken und Visualisierungen
- **Time Filters**: Täglich, wöchentlich, monatlich, jährlich

### 🎨 **Modern UI/UX**
- **Responsive Design**: Optimiert für alle Geräte
- **Dark Mode**: Automatische Theme-Erkennung
- **Smooth Animations**: Flüssige Übergänge und Interaktionen
- **Mobile-First**: Perfekt für Smartphones und Tablets

### 🔧 **Technical Features**
- **Next.js 15**: Mit Turbopack für Development
- **TypeScript**: Vollständig typisiert
- **Supabase**: Real-time Database mit Auth
- **Tailwind CSS**: Utility-First Styling
- **PWA**: Progressive Web App Funktionalität

## 🚀 Live Demo

**Teste die App online**: [https://habit.njo.codes](https://habit.njo.codes)

## 🛠️ Installation & Setup

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Supabase Account

### 1. Repository klonen
```bash
git clone https://github.com/njocodes/habittracker.git
cd habittracker
```

### 2. Dependencies installieren
```bash
npm install
# oder
yarn install
```

### 3. Environment Variables konfigurieren
Erstelle eine `.env.local` Datei:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Database Setup
```sql
-- Users Table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits Table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT DEFAULT '📝',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habit Entries Table
CREATE TABLE habit_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Indexes für Performance
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habit_entries_habit_id ON habit_entries(habit_id);
CREATE INDEX idx_habit_entries_user_id ON habit_entries(user_id);
CREATE INDEX idx_habit_entries_date ON habit_entries(date);
```

### 5. Development Server starten
```bash
npm run dev
# oder
yarn dev
```

Die App ist jetzt verfügbar unter `http://localhost:3000`

## 📱 Verwendung

### Habit erstellen
1. Klicke auf "Neue Gewohnheit"
2. Gib Name, Beschreibung und Farbe ein
3. Wähle ein Icon aus
4. Speichere die Gewohnheit

### Habit tracken
1. Gehe zum Dashboard
2. Klicke auf das Checkbox-Symbol für den Tag
3. Füge optional Notizen hinzu
4. Verfolge deinen Fortschritt

### Statistiken anzeigen
1. Klicke auf "Statistiken"
2. Wähle Zeitraum (Täglich, Wöchentlich, etc.)
3. Analysiere deine Erfolgsrate
4. Erkenne Muster und Trends

## 🔧 Performance Optimierungen

### Service Worker
- **Offline-First**: Funktioniert ohne Internet
- **Aggressive Caching**: 1 Jahr für statische Assets
- **Background Sync**: Automatische Synchronisation

### Bundle Optimierung
- **Tree Shaking**: Entfernung ungenutzten Codes
- **Code Splitting**: Intelligente Chunk-Aufteilung
- **Minification**: Aggressive JS/CSS-Kompression

### Caching Strategien
- **API Routes**: 5-30 Minuten Cache
- **Static Assets**: 1 Jahr Cache
- **Pages**: 1 Stunde Cache
- **Service Worker**: Offline-Caching

## 🚀 Deployment

### Vercel (Empfohlen)
1. Verbinde dein GitHub Repository mit Vercel
2. Konfiguriere Environment Variables
3. Deploy automatisch bei jedem Push

### Andere Plattformen
```bash
# Build für Production
npm run build

# Start Production Server
npm start
```

## 📊 Performance Monitoring

### Lighthouse Scores
- **Performance**: 90%+
- **Accessibility**: 100%
- **Best Practices**: 100%
- **SEO**: 100%
- **PWA**: 100%

### Core Web Vitals
- **FCP**: < 1.8s
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

## 🛠️ Development

### Scripts
```bash
# Development
npm run dev

# Build
npm run build

# Start Production
npm start

# Linting
npm run lint

# Type Checking
npm run type-check
```

### Code Structure
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── dashboard/      # Dashboard Pages
│   └── globals.css     # Global Styles
├── components/         # React Components
│   ├── ui/            # UI Components
│   └── forms/         # Form Components
├── hooks/             # Custom Hooks
├── lib/               # Utilities
└── types/             # TypeScript Types
```

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📄 Lizenz

MIT License - Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- **Next.js Team** für das fantastische Framework
- **Supabase Team** für die großartige Backend-Lösung
- **Tailwind CSS** für das Utility-First CSS Framework
- **Vercel** für das Hosting und die Performance-Optimierungen

## 📞 Support

Bei Fragen oder Problemen:
- **GitHub Issues**: [Issues](https://github.com/njocodes/habittracker/issues)
- **Email**: [Deine Email]
- **Twitter**: [@DeinTwitter]

---

**Entwickelt mit ❤️ und extremen Performance-Optimierungen**
