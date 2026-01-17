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

Maak een `.env` bestand in de `backend` directory met de volgende variabelen (gebruik `backend/.env.example` als template). Commit nooit `.env` bestanden naar git.

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

CI/CD security setup (SAST/SCA/SBOM gates) staat beschreven in `.github/SECURITY_CICD.md`.

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

#### Backend Unit Tests

##### app.controller.spec.ts
- **root endpoint**: Test of "Hello World!" wordt geretourneerd

##### auth.service.spec.ts
- **login met valide credentials**: Controleert of access token wordt gegenereerd bij correcte inloggegevens
- **login met onbekende gebruiker**: Verifieert dat UnauthorizedException wordt gegooid voor niet-bestaande gebruikers
- **login met fout wachtwoord**: Test dat UnauthorizedException wordt gegooid bij incorrect wachtwoord
- **registratie nieuwe gebruiker**: Controleert of nieuwe gebruiker wordt aangemaakt en access token wordt gegenereerd
- **registratie bestaande gebruiker**: Verifieert dat ConflictException wordt gegooid als email al bestaat

##### module.service.spec.ts
- **findAll**: Test of alle modules worden geretourneerd
- **findAll zonder modules**: Verifieert dat lege array wordt geretourneerd wanneer geen modules bestaan
- **findById gevonden**: Controleert of module wordt geretourneerd wanneer gevonden
- **findById niet gevonden**: Test dat null wordt geretourneerd wanneer module niet bestaat
- **findByExternalId**: Verifieert zoeken op externe ID

##### user.service.spec.ts
- **updateProfile met valide data**: Test of profiel correct wordt bijgewerkt met geldige gegevens
- **validatie van skills**: Controleert dat te lange skill arrays worden afgewezen
- **validatie van interests**: Verifieert dat te lange interest arrays worden afgewezen
- **validatie van studyProgram**: Test dat lege of te lange studyProgram wordt afgewezen
- **addFavorite**: Controleert of favoriete module wordt toegevoegd
- **removeFavorite**: Test of favoriete module wordt verwijderd
- **getFavorites**: Verifieert ophalen van favoriete modules met details

##### recommendation.service.spec.ts
- **getRecommendations**: Test of aanbevelingen worden geretourneerd op basis van gebruikersprofiel
- **lege aanbevelingen**: Verifieert dat lege array wordt geretourneerd als geen matches gevonden
- **similarity score**: Controleert of similarity scores correct worden geretourneerd
- **match_terms**: Test of match terms correct worden doorgegeven

##### auth.controller.spec.ts
- **register nieuwe gebruiker**: Test of nieuwe gebruiker kan worden geregistreerd via controller
- **register bestaande gebruiker**: Verifieert dat error wordt gegooid bij bestaande email
- **login met valide credentials**: Controleert login via controller endpoint
- **login met ongeldige credentials**: Test dat error wordt gegooid bij fout wachtwoord
- **logout**: Verifieert dat token wordt geïnvalideerd na logout

##### module.controller.spec.ts
- **findAll**: Test of alle modules worden geretourneerd via controller
- **findById**: Controleert ophalen van specifieke module
- **findById niet gevonden**: Test null response voor niet-bestaande module
- **findByExternalId**: Verifieert zoeken op externe ID via controller
- **search**: Test zoekfunctionaliteit voor modules
- **getAllTags**: Controleert ophalen van alle beschikbare tags

##### user.controller.spec.ts
- **updateProfile succesvol**: Test of profiel succesvol wordt bijgewerkt
- **updateProfile met ongeldige data**: Verifieert dat validatie errors worden gegooid
- **getProfile**: Controleert ophalen van gebruikersprofiel
- **getFavorites**: Test ophalen van favoriete modules
- **addFavorite**: Verifieert toevoegen van module aan favorieten
- **removeFavorite**: Test verwijderen van module uit favorieten

##### recommendation.controller.spec.ts
- **getRecommendations met user profiel**: Test ophalen van aanbevelingen op basis van ingelogde gebruiker
- **getRecommendations met query parameters**: Verifieert dat query parameters defaults overschrijven
- **getRecommendations met k parameter**: Controleert dat aantal aanbevelingen kan worden ingesteld
- **mapping van user data**: Test correcte mapping van user data naar recommendation request

#### Backend E2E Tests

##### app.e2e-spec.ts
- **root GET**: Test of root endpoint "Hello World!" retourneert

##### modules.e2e-spec.ts
- **GET /api/modules met auth**: Test ophalen van alle modules met geldige authenticatie
- **GET /api/modules zonder auth**: Verifieert dat 401 wordt geretourneerd zonder token
- **GET /api/modules met ongeldige auth**: Test dat ongeldige tokens worden afgewezen
- **GET /api/modules/search met query**: Controleert zoeken naar modules met zoekterm
- **GET /api/modules/search zonder query**: Test ophalen van alle modules via search endpoint
- **GET /api/modules/search geen resultaten**: Verifieert lege array bij geen matches
- **GET /api/modules/getAllTags**: Test ophalen van alle beschikbare module tags

##### users.e2e-spec.ts
- **GET /api/user/getProfile**: Test ophalen van gebruikersprofiel met authenticatie
- **GET /api/user/getProfile zonder auth**: Verifieert dat authenticatie vereist is
- **POST /api/user/updateProfile met valide data**: Test succesvol bijwerken van profiel
- **POST /api/user/updateProfile met lege studyProgram**: Verifieert validatie van studyProgram
- **POST /api/user/updateProfile met te lange studyProgram**: Test maximale lengte validatie
- **POST /api/user/updateProfile met te veel skills**: Controleert array grootte validatie
- **POST /api/user/updateProfile met te veel interests**: Test maximale aantal interests
- **POST /api/user/addFavorite**: Verifieert toevoegen van favoriete module
- **POST /api/user/removeFavorite**: Test verwijderen van favoriete module
- **GET /api/user/getFavorites**: Controleert ophalen van alle favorieten

##### token-invalidation.e2e-spec.ts
- **registreer test gebruiker**: Test volledige registratie flow
- **toegang met valide token**: Verifieert dat valide token toegang geeft tot protected endpoints
- **invalideer token na logout**: Test dat token niet meer werkt na logout
- **afgewezen geïnvalideerde token**: Controleert dat alle endpoints geïnvalideerde tokens afwijzen
- **nieuwe token na re-login**: Verifieert dat nieuw token werkt na opnieuw inloggen

#### Frontend Unit Tests

##### login.spec.tsx
- **render login form**: Test of login formulier correct wordt weergegeven
- **update form velden**: Verifieert dat input velden waarden opslaan
- **call login on submit**: Controleert dat login functie wordt aangeroepen bij submit
- **navigate naar dashboard**: Test redirect naar dashboard na succesvolle login
- **toon error bij login failure**: Verifieert dat foutmeldingen worden getoond
- **disable submit tijdens loading**: Test dat submit button disabled is tijdens laden
- **validatie lege velden**: Controleert client-side validatie
- **link naar register pagina**: Test dat link naar registratie pagina werkt

##### register.spec.tsx
- **render register form**: Test of registratie formulier correct wordt weergegeven
- **update form velden**: Verifieert dat alle input velden waarden opslaan
- **validatie wachtwoorden niet gelijk**: Test dat error wordt getoond als wachtwoorden niet matchen
- **validatie wachtwoord te kort**: Controleert minimale wachtwoord lengte validatie
- **validatie wachtwoord complexiteit**: Verifieert dat wachtwoord complexiteitseisen worden getoond
- **validatie voornaam verplicht**: Test required validatie voor voornaam
- **validatie achternaam verplicht**: Controleert required validatie voor achternaam
- **validatie email verplicht**: Verifieert required validatie voor email
- **call register on submit**: Test dat register functie wordt aangeroepen bij submit
- **navigate naar dashboard na registratie**: Controleert redirect na succesvolle registratie

##### keuzemodules.spec.tsx
- **pagina titel**: Controleert of de titel "Keuzemodules" wordt weergegeven
- **modules laden**: Test of modules correct worden opgehaald en getoond
- **lange beschrijvingen afkappen**: Verifieert dat beschrijvingen langer dan 180 karakters worden afgekapt met "..."
- **module metadata**: Controleert of ECTS, locatie en andere metadata correct worden weergegeven
- **zoekfunctie**: Test of het zoekveld aanwezig is
- **loading state**: Verifieert dat "Laden..." wordt getoond tijdens het ophalen van data
- **error state**: Test of foutmeldingen correct worden getoond bij API errors
- **favoriet toggle**: Controleert of toggleFavorite functie wordt aangeroepen bij klikken op favoriet button

##### ProtectedRoute.spec.tsx
- **render children met valide token**: Test dat protected content wordt getoond met geldige authenticatie
- **render children met token in localStorage**: Verifieert dat localStorage token wordt gebruikt
- **redirect naar login zonder token**: Controleert redirect wanneer geen token aanwezig is
- **redirect naar login met verlopen token**: Test dat verlopen tokens worden afgewezen
- **redirect naar login met malformed token**: Verifieert dat ongeldige token formats worden afgewezen

##### auth.service.spec.ts
- **login succesvol**: Test succesvolle login met correcte credentials
- **login failed**: Verifieert error handling bij ongeldige credentials
- **register succesvol**: Controleert succesvolle registratie van nieuwe gebruiker
- **register failed**: Test error handling bij bestaande email
- **logout**: Verifieert dat token wordt verwijderd na logout
- **logout zonder token**: Test logout wanneer geen token aanwezig is

##### module.service.spec.ts
- **getAllModules succesvol**: Test ophalen van alle modules
- **getAllModules endpoint not found**: Verifieert 404 error handling
- **getAllModules fetch failed**: Test server error handling
- **getAllModules network error**: Controleert network error handling
- **getModuleById succesvol**: Test ophalen van specifieke module
- **getModuleById niet gevonden**: Verifieert null response voor niet-bestaande module
- **searchModules**: Test zoekfunctionaliteit met query parameter
- **getAllTags**: Controleert ophalen van alle beschikbare tags

## Licentie

UNLICENSED
