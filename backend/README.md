# Backend - NestJS API

NestJS backend API voor gebruikersbeheer, authenticatie en modulebeheer.

## Vereisten

- Node.js v18 of hoger
- MongoDB
- npm

## Installatie

```bash
npm install
```

## Configuratie

Maak een `.env` bestand in de root van de backend directory:

```
MONGODB_URI=mongodb://localhost:27017/ati
JWT_SECRET=your-secret-key-here
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## Starten

### Development mode

```bash
npm run start:dev
```

### Production mode

```bash
npm run build
npm run start:prod
```

## Scripts

- `npm run start` - Start de applicatie
- `npm run start:dev` - Start in development mode met hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run build` - Build de applicatie
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Run tests met coverage
- `npm run lint` - Run ESLint
- `npm run format` - Format code met Prettier

## Architectuur

De backend volgt een clean architecture structuur:

- **domain**: Entities en repository interfaces
- **application**: Business logic en services
- **infrastructure**: Database implementaties, auth guards, schemas
- **interfaces**: Controllers en presenters

## API Endpoints

De API draait standaard op `http://localhost:3000`

### Authenticatie

- POST `/auth/login` - Login
- POST `/auth/register` - Registratie

### Modules

- GET `/modules` - Haal alle modules op
- GET `/modules/:id` - Haal specifieke module op

### Gebruikers

- GET `/users/profile` - Haal gebruikersprofiel op
- PUT `/users/profile` - Update gebruikersprofiel

## Database

De applicatie gebruikt MongoDB met Mongoose. Zorg dat MongoDB draait voordat je de applicatie start.

## Security

- JWT authenticatie
- Password hashing met bcrypt
- CORS configuratie
- Input validatie met class-validator
