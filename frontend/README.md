# Frontend - React Applicatie

React frontend applicatie voor het module aanbevelingssysteem.

## Vereisten

- Node.js v18 of hoger
- npm of yarn

## Installatie

```bash
npm install
```

## Starten

### Development mode

```bash
npm run dev
```

De applicatie draait standaard op `http://localhost:5173`

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build voor productie
- `npm run preview` - Preview productie build
- `npm run lint` - Run ESLint
- `npm run format` - Format code met Prettier

## Technologie Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool en dev server
- **React Router** - Routing
- **jsPDF** - PDF generatie

## Projectstructuur

```
src/
├── features/          # Feature modules
│   ├── auth/         # Authenticatie
│   ├── dashboard/    # Dashboard
│   ├── modules/      # Module overzicht
│   ├── profile/      # Gebruikersprofiel
│   └── settings/     # Instellingen
├── shared/           # Gedeelde componenten
│   ├── components/   # Herbruikbare componenten
│   ├── contexts/       # React contexts
│   ├── locales/     # Internationalisatie
│   ├── types/       # TypeScript types
│   └── utils/       # Utility functies
└── App.tsx          # Hoofdcomponent
```

## Features

- Gebruikersauthenticatie (login/registratie)
- Dashboard met favoriete modules
- Module overzicht met zoeken en filteren
- AI-gebaseerde module aanbevelingen
- Gebruikersprofiel beheer
- Instellingen pagina
- Meertalige ondersteuning (Nederlands/Engels)

## Environment Variabelen

Maak een `.env` bestand voor environment variabelen:

```
VITE_API_URL=http://localhost:3000
VITE_RECOMMENDER_API_URL=http://localhost:8000
```

## API Integratie

De frontend communiceert met:
- Backend API op `http://localhost:3000` (standaard)
- Recommender API op `http://localhost:8000` (standaard)

## Styling

Styling wordt gedaan via CSS bestanden:
- `src/index.css` - Globale styles
- `src/App.css` - App specifieke styles
- Component specifieke CSS bestanden

## Build Output

Na `npm run build` wordt de productie build gegenereerd in de `dist` directory.
