# ATIx AI Lu3 - Module Aanbevelingssysteem

Dit project is een module aanbevelingssysteem voor studenten. Het systeem gebruikt AI om gepersonaliseerde keuzemodule aanbevelingen te geven op basis van het studentprofiel.

## Projectstructuur

Het project bestaat uit drie hoofdcomponenten:

- **backend**: NestJS backend API voor gebruikersbeheer, authenticatie en modulebeheer
- **api-recommender**: FastAPI service voor AI-gebaseerde module aanbevelingen
- **frontend**: React frontend applicatie voor gebruikersinterface

## Vereisten

- Node.js (v18 of hoger)
- Python 3.8 of hoger
- MongoDB
- npm of yarn

## Installatie

### Backend

```bash
cd backend
npm install
```

### API Recommender

```bash
cd api-recommender
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Configuratie

### Backend

Maak een `.env` bestand in de `backend` directory met de volgende variabelen:

```
MONGODB_URI=mongodb://localhost:27017/ati
JWT_SECRET=your-secret-key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### API Recommender

Het CSV dataset bestand moet beschikbaar zijn in `api-recommender/data/Uitgebreide_VKM_dataset_cleaned2.csv`

## Starten

### Development

Start alle services in aparte terminals:

**Backend:**
```bash
cd backend
npm run start:dev
```

**API Recommender:**
```bash
cd api-recommender
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Documentatie

Gedetailleerde documentatie is beschikbaar in de `Documentatie` directory:
- Architectuur-ontwerp
- AI-Integratie
- Security Requirements
- Testplan
- UX-ontwerp

## Testen

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

### Test Documentatie

#### Backend - auth.service.spec.ts
- **login met valide credentials**: Controleert of access token wordt gegenereerd bij correcte inloggegevens
- **login met onbekende gebruiker**: Verifieert dat UnauthorizedException wordt gegooid voor niet-bestaande gebruikers
- **login met fout wachtwoord**: Test dat UnauthorizedException wordt gegooid bij incorrect wachtwoord
- **registratie nieuwe gebruiker**: Controleert of nieuwe gebruiker wordt aangemaakt en access token wordt gegenereerd
- **registratie bestaande gebruiker**: Verifieert dat ConflictException wordt gegooid als email al bestaat

#### Backend - app.controller.spec.ts
- **root endpoint**: Test of "Hello World!" wordt geretourneerd

#### Frontend - keuzemodules.spec.tsx
- **pagina titel**: Controleert of de titel "Keuzemodules" wordt weergegeven
- **modules laden**: Test of modules correct worden opgehaald en getoond
- **lange beschrijvingen afkappen**: Verifieert dat beschrijvingen langer dan 180 karakters worden afgekapt met "..."
- **module metadata**: Controleert of ECTS, locatie en andere metadata correct worden weergegeven
- **zoekfunctie**: Test of het zoekveld aanwezig is
- **loading state**: Verifieert dat "Laden..." wordt getoond tijdens het ophalen van data
- **error state**: Test of foutmeldingen correct worden getoond bij API errors
- **favoriet toggle**: Controleert of toggleFavorite functie wordt aangeroepen bij klikken op favoriet button

## Licentie

UNLICENSED
