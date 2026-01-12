# API Recommender - FastAPI Service

FastAPI service voor AI-gebaseerde module aanbevelingen op basis van studentprofielen.

## Vereisten

- Python 3.8 of hoger
- pip

## Installatie

```bash
pip install fastapi uvicorn scikit-learn pandas numpy
```

Of installeer via requirements.txt (indien aanwezig):

```bash
pip install -r requirements.txt
```

## Dataset

Zorg dat het CSV dataset bestand beschikbaar is:
- Pad: `data/Uitgebreide_VKM_dataset_cleaned2.csv`

Het dataset wordt automatisch geladen bij het starten van de service.

## Starten

### Development mode

```bash
uvicorn main:app --reload
```

### Production mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

De service draait standaard op `http://localhost:8000`

## API Documentatie

Na het starten is de API documentatie beschikbaar op:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints

### Health Check

- GET `/` - Root endpoint
- GET `/health` - Health check endpoint

### Recommendations

- POST `/api/recommend` - Krijg module aanbevelingen

#### Request Body

```json
{
  "study_program": "string",
  "interests": ["string"],
  "skills": ["string"],
  "favorites": ["string"],
  "k": 5,
  "study_location": "string",
  "study_credit": "string",
  "level": "string"
}
```

#### Response

```json
{
  "recommendations": [
    {
      "module_id": "string",
      "score": 0.0,
      "reason": "string"
    }
  ],
  "stats": {
    "modules_count": 0,
    "features_count": 0
  }
}
```

## Configuratie

Configuratie kan aangepast worden in `app/core/config.py`:

- `CSV_PATH`: Pad naar het dataset bestand
- `DEFAULT_TOP_N`: Standaard aantal aanbevelingen
- `MAX_TOP_N`: Maximum aantal aanbevelingen
- TF-IDF parameters voor tekstverwerking

## Machine Learning

De service gebruikt:
- TF-IDF vectorisatie voor tekstanalyse
- Cosine similarity voor het vinden van vergelijkbare modules
- Feature matching op basis van studentprofiel

## Logging

De service logt belangrijke events naar de console:
- Dataset loading
- Service initialisatie
- API requests
