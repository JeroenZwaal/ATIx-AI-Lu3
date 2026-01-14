# App configuration
import os

class Settings:
    API_TITLE = "Module Recommendation API"
    API_DESCRIPTION = "API voor het voorspellen van keuzemodule aanbevelingen op basis van studentprofiel"
    API_VERSION = "1.0.0"
    
    # Dataset configuration
    CSV_PATH = os.getenv("CSV_PATH", "data/Uitgebreide_VKM_dataset_cleaned2.csv")

    # Optional cache to speed up cold starts (recommended on Azure App Service)
    # Example: /home/site/recommender_cache.joblib
    RECOMMENDER_CACHE_PATH = os.getenv("RECOMMENDER_CACHE_PATH", "")
    
    # ML configuration
    TFIDF_NGRAM_RANGE = (1, 2)
    TFIDF_MAX_DF = 0.8
    TFIDF_MIN_DF = 2
    
    # API configuration
    DEFAULT_TOP_N = 5
    MAX_TOP_N = 20

settings = Settings()