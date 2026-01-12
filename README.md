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

## Licentie

UNLICENSED
