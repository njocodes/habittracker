# 🤝 Contributing to Habit Tracker

Vielen Dank für dein Interesse, zu Habit Tracker beizutragen! Wir freuen uns über deine Hilfe.

## 🚀 Getting Started

### 1. Fork das Repository
Klicke auf den "Fork" Button oben rechts auf der GitHub-Seite.

### 2. Clone dein Fork
```bash
git clone https://github.com/DEIN-USERNAME/habittracker.git
cd habittracker
```

### 3. Remote hinzufügen
```bash
git remote add upstream https://github.com/njocodes/habittracker.git
```

### 4. Branch erstellen
```bash
git checkout -b feature/DEINE-FEATURE-BESCHREIBUNG
```

## 🛠️ Development Setup

### Dependencies installieren
```bash
npm install
```

### Environment Variables
```bash
cp .env.example .env.local
# Fülle die .env.local mit deinen Werten aus
```

### Development Server starten
```bash
npm run dev
```

## 📝 Code Standards

### TypeScript
- Verwende strikte TypeScript-Konfiguration
- Definiere explizite Typen für alle Funktionen
- Vermeide `any` - verwende spezifische Typen

### React
- Verwende Functional Components mit Hooks
- Implementiere `React.memo` für Performance
- Verwende `useCallback` und `useMemo` wo nötig

### Styling
- Verwende Tailwind CSS Utility Classes
- Halte Komponenten klein und fokussiert
- Verwende CSS Modules für komplexe Styles

### Performance
- Optimiere für Lighthouse Score 90%+
- Minimiere Bundle Size
- Implementiere Lazy Loading wo möglich

## 🧪 Testing

### Tests schreiben
```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Performance Tests
```bash
# Lighthouse Test
npm run perf:test

# Bundle Analysis
npm run analyze
```

## 📋 Pull Request Process

### 1. Code committen
```bash
git add .
git commit -m "feat: Add new feature description"
```

### 2. Push zum Branch
```bash
git push origin feature/DEINE-FEATURE-BESCHREIBUNG
```

### 3. Pull Request erstellen
- Verwende eine aussagekräftige Beschreibung
- Verlinke relevante Issues
- Füge Screenshots hinzu wenn nötig

### 4. Code Review
- Beantworte Feedback konstruktiv
- Mache requested changes
- Halte den PR aktuell

## 🐛 Bug Reports

### Bug Report Template
```markdown
**Bug Description**
Eine klare Beschreibung des Bugs.

**Steps to Reproduce**
1. Gehe zu '...'
2. Klicke auf '...'
3. Scrolle zu '...'
4. Siehe Fehler

**Expected Behavior**
Was sollte passieren?

**Actual Behavior**
Was passiert tatsächlich?

**Screenshots**
Füge Screenshots hinzu.

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Eine klare Beschreibung der gewünschten Funktion.

**Use Case**
Warum ist diese Funktion nützlich?

**Proposed Solution**
Wie soll die Funktion implementiert werden?

**Alternatives**
Welche Alternativen wurden in Betracht gezogen?
```

## 📚 Documentation

### Code Documentation
- Kommentiere komplexe Logik
- Verwende JSDoc für Funktionen
- Halte README aktuell

### API Documentation
- Dokumentiere alle API Endpoints
- Füge Beispiele hinzu
- Beschreibe Request/Response Format

## 🎯 Performance Guidelines

### Bundle Size
- Halte Bundle Size unter 500KB
- Verwende Tree Shaking
- Implementiere Code Splitting

### Runtime Performance
- Optimiere für Core Web Vitals
- Minimiere Re-Renders
- Verwende Service Worker

### Caching
- Implementiere intelligentes Caching
- Verwende CDN wo möglich
- Optimiere für Offline-Nutzung

## 🔒 Security

### Security Guidelines
- Validiere alle Inputs
- Verwende HTTPS
- Implementiere Rate Limiting
- Halte Dependencies aktuell

### Vulnerability Reports
- Melde Sicherheitslücken privat
- Verwende GitHub Security Advisories
- Warte auf Bestätigung vor Veröffentlichung

## 📞 Support

### Fragen?
- **GitHub Discussions**: Für allgemeine Fragen
- **GitHub Issues**: Für Bugs und Features
- **Email**: [Deine Email]

### Community
- Respektiere andere Contributors
- Sei konstruktiv bei Feedback
- Helfe anderen beim Lernen

## 🏆 Recognition

### Contributors
Alle Contributors werden in der README erwähnt.

### Special Thanks
Besondere Beiträge werden besonders gewürdigt.

---

**Vielen Dank für deinen Beitrag zu Habit Tracker! 🎉**
