import re
import string
import numpy as np
import pandas as pd
import random
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Optional, Dict, Any
import nltk
from nltk.corpus import stopwords

from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RecommendationService:
    def __init__(self):
        self.df = None
        self.vectorizer = None
        self.X = None
        self.feature_names = None
        self._initialize_stopwords()

    def _initialize_stopwords(self):
        """Initialize Dutch stopwords and custom noise words."""
        try:
            self.dutch_stopwords = set(stopwords.words("dutch"))
        except LookupError:
            nltk.download("stopwords")
            self.dutch_stopwords = set(stopwords.words("dutch"))

        self.extra_noise = {
            "bij", "voor", "met", "door", "zonder", "over",
            "doelgroep", "werk", "werken", "proces", "praktijk",
            "ontwikkeling", "ontwikkelen", "gaan",
            "leren", "school", "module", "modules", "thema",
            "student", "opleiding", "kun", "vanuit",
            "eigen", "zelf", "samen", "samenwerken",
            "jaar", "week", "periode", "naasten", "daarnaast",
            "minor", "studenten", "programma", "keuzemodule",
            "casus", "casussen", "cases", "vraagstukken",
            "stage", "stageschool", "kennismakingsstage",
            "kennis", "vaardigheid", "vaardigheden", "ervaring", "ervaringen",
            "lessen", "onderwerpen", "theorie", "praktijk", "praktische", "inhoudelijke",
            "mee", "doe", "vinden", "vind", "kies", "openstaan"
            "belangrijk", "positief", "mogelijkheden", "mogelijkheid",
            "impact", "betekenis", "betekent", "betekenen",
            "you", "your", "are", "will", "what", "then", "like", "choose",
            "interested", "experiencing", "hbo", "and", "the", "persoonlijke",
            "denken", "maken", "business", "verdieping", "emgeving",
            "bouwen", "thinking", "branding", "maken", "urban", "veiligheid",
            "nieuwe", "test", "gebouwde", "concept", "project", "omgeving", "actuele", "acute",
            "yellow", "belt", "serious", "hrm", "mensen", "snel", "binnen", "materialen",
            "active", "druk", "context", "leven", "complexe", "brede", "for", "jouw", "manieren"
        }

        self.text_stopwords = self.dutch_stopwords | self.extra_noise
        self.punct_table = str.maketrans("", "", string.punctuation + "''""´`")

    def clean_text_for_matching(self, text: str) -> str:
        """Clean text for matching."""
        if not isinstance(text, str):
            return ""
        
        # lowercase
        text = text.lower()
        
        # remove punctuation
        text = text.translate(self.punct_table)
        
        # remove digits
        text = re.sub(r"\d+", " ", text)
        
        # multiple spaces
        text = re.sub(r"\s+", " ", text).strip()
        
        # filter stopwords but keep important abbreviations
        tokens = []
        for tok in text.split():
            # Keep important tech abbreviations even if short
            if tok.upper() in ["AI", "ML", "UI", "UX", "IT", "API", "SQL", "CSS", "JS"]:
                tokens.append(tok.lower())
            # Keep other tokens if not stopword and length > 2
            elif tok not in self.text_stopwords and len(tok) > 2:
                tokens.append(tok)
        
        return " ".join(tokens)

    def _format_term_list(self, terms: List[str]) -> str:
        """Format list of terms in Dutch."""
        if not terms:
            return ""
        if len(terms) == 1:
            return f"'{terms[0]}'"
        if len(terms) == 2:
            return f"'{terms[0]}' en '{terms[1]}'"
        # 3 or more
        quoted = [f"'{t}'" for t in terms]
        hoofd = ", ".join(quoted[:-1])
        laatste = quoted[-1]
        return f"{hoofd} en {laatste}"

    def build_reason(self, match_terms: List[str], module_name: Optional[str] = None, score: Optional[float] = None) -> str:
        """Generate Dutch explanation why module fits."""
        terms_str = self._format_term_list(match_terms)

        # score -> indication of match strength
        if score is None:
            kwalificatie = "goed"
        elif score >= 0.8:
            kwalificatie = "erg goed"
        elif score >= 0.6:
            kwalificatie = "goed"
        else:
            kwalificatie = "redelijk"

        # No specific terms: general explanation
        if not match_terms:
            templates = [
                "Deze module sluit {kwalificatie} aan bij je interesses op basis van tekstuele overeenkomsten.",
                "Op basis van de overeenkomst tussen jouw profiel en de modulebeschrijving lijkt deze module {kwalificatie} bij je te passen.",
                "Deze module lijkt inhoudelijk {kwalificatie} aan te sluiten bij wat je interessant vindt."
            ]
        else:
            # With match_terms
            if module_name:
                templates = [
                    "Je interesse in {terms} komt duidelijk terug in '{module}', waardoor deze module {kwalificatie} bij je aansluit.",
                    "Omdat {terms} centraal staan in '{module}', past deze module {kwalificatie} bij jouw interesses.",
                    "In '{module}' komen {terms} aan bod, wat goed aansluit bij jouw interesses."
                ]
            else:
                templates = [
                    "Deze module sluit {kwalificatie} aan bij je interesses in {terms}.",
                    "Omdat {terms} in deze module aan bod komen, lijkt deze {kwalificatie} bij je te passen.",
                    "Je interesse in {terms} komt terug in de inhoud van deze module, waardoor deze goed bij je past."
                ]

        template = random.choice(templates)
        return template.format(
            kwalificatie=kwalificatie,
            terms=terms_str,
            module=module_name if module_name else ""
        )

    def extract_match_terms(self, student_vec, module_vec, max_terms: int = 8) -> List[str]:
        """Extract matching terms between student and module vectors, prioritizing compound terms."""
        # indices where vector is not 0
        student_idx = set(student_vec.nonzero()[1])
        module_idx = set(module_vec.nonzero()[1])

        shared_idx = sorted(student_idx & module_idx)
        all_terms = [self.feature_names[i] for i in shared_idx]
        
        # Separate single words from compound terms
        single_terms = [term for term in all_terms if ' ' not in term]
        compound_terms = [term for term in all_terms if ' ' in term]
        
        # Remove single terms that are part of compound terms
        filtered_single_terms = []
        for single_term in single_terms:
            # Check if this single term is part of any compound term
            is_part_of_compound = any(single_term in compound_term for compound_term in compound_terms)
            if not is_part_of_compound:
                filtered_single_terms.append(single_term)
        
        # Combine compound terms first, then filtered single terms
        final_terms = compound_terms + filtered_single_terms
        
        return final_terms[:max_terms]

    def load_dataset(self, csv_path: str):
        """Load and preprocess dataset."""
        self.df = pd.read_csv(csv_path)
        
        # Text preprocessing
        text_columns = ["name", "shortdescription"]
        
        def build_raw_text(row: pd.Series) -> str:
            parts = []
            for col in text_columns:
                if col in row and isinstance(row[col], str):
                    parts.append(row[col])
            return " ".join(parts)
        
        self.df["raw_text"] = self.df.apply(build_raw_text, axis=1)
        self.df["clean_text"] = self.df["raw_text"].apply(self.clean_text_for_matching)
        
        # Initialize vectorizer
        self.vectorizer = TfidfVectorizer(
            ngram_range=settings.TFIDF_NGRAM_RANGE or (1, 2),
            max_df=settings.TFIDF_MAX_DF or 0.8,
            min_df=settings.TFIDF_MIN_DF or 2,
        )


        
        self.X = self.vectorizer.fit_transform(self.df["clean_text"])
        self.feature_names = self.vectorizer.get_feature_names_out()

    def get_recommendations(
        self,
        study_program: Optional[str] = None,
        interests: Optional[List[str]] = None,
        skills: Optional[List[str]] = None,
        favorites: Optional[List[str]] = None,
        top_n: int = 5,
        study_credit: Optional[int] = None,
        level: Optional[str] = None,
        location: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get module recommendations based on student fields using hybrid approach.
        No hard filtering - preferences are applied as soft constraints (score adjustments).
        """
        if self.df is None or self.vectorizer is None or self.X is None:
            raise ValueError("Model not initialized. Call load_dataset first.")
        
        # Combine all student fields into clean text with weighted importance
        student_text_parts = []
        
        # Study program: 1x weight (context, not leading)
        if study_program:
            student_text_parts.append(study_program)
        
        # Skills: 1.5x weight (supporting, not leading)  
        if skills:
            for skill in skills:
                student_text_parts.extend([skill] * 1)  # 1x base
                student_text_parts.append(skill)        # +0.5x = 1.5x total
        
        # Interests: 3x weight (most important - real passion)
        if interests:
            for interest in interests:
                student_text_parts.extend([interest] * 3)
        
        # Favorites: 3x weight (also real preferences)
        if favorites:
            for favorite in favorites:
                student_text_parts.extend([favorite] * 3)
        
        # Create clean student profile from weighted fields
        student_text = " ".join(student_text_parts) if student_text_parts else "student"
        
        # Work with full dataset (no filtering)
        df_work = self.df.copy()

        # Vectorize student text
        clean_profile = self.clean_text_for_matching(student_text)
        student_vec = self.vectorizer.transform([clean_profile])

        # Calculate cosine similarity for ALL modules
        sims = cosine_similarity(student_vec, self.X).flatten()

        # Add similarity scores to dataframe
        df_work["similarity_raw"] = sims

        # Apply hybrid scoring: adjust scores based on preference matches
        df_work["hybrid_score"] = sims.copy()
        
        # Use additive boosts to keep scores in 0-1 range
        boost_amount = 0.10  # Add 0.10 for matching preferences
        penalty_amount = 0.10  # Subtract 0.10 for non-matching preferences
        
        # Location preference adjustment with bidirectional matching
        if location is not None:
            # Split both student preference and module locations into individual cities
            student_cities = [city.strip() for city in location.lower().split(' en ')]
            
            def location_matches(module_location):
                if pd.isna(module_location):
                    return False
                module_cities = [city.strip() for city in str(module_location).lower().split(' en ')]
                # Check if any student city matches any module city
                return any(
                    student_city in module_city or module_city in student_city 
                    for student_city in student_cities 
                    for module_city in module_cities
                )
            
            location_match = df_work["location"].apply(location_matches)
            df_work.loc[location_match, "hybrid_score"] += boost_amount
            df_work.loc[~location_match, "hybrid_score"] -= penalty_amount
        
        # Study credit preference adjustment
        if study_credit is not None:
            # Convert both to same type for comparison
            credit_match = df_work["studycredit"].astype(int) == int(study_credit)
            df_work.loc[credit_match, "hybrid_score"] += boost_amount
            df_work.loc[~credit_match, "hybrid_score"] -= penalty_amount
        
        # Level preference adjustment  
        if level is not None:
            level_match = df_work["level"] == level
            df_work.loc[level_match, "hybrid_score"] += boost_amount
            df_work.loc[~level_match, "hybrid_score"] -= penalty_amount

        # Clamp scores to valid range [0, 1]
        df_work["hybrid_score"] = df_work["hybrid_score"].clip(0, 1)

        # Keep hybrid score as final similarity (no normalization)
        # This preserves the effect of location/credit/level preferences
        df_work["similarity"] = df_work["hybrid_score"]

        # Sort by hybrid score and get top N
        top = df_work.sort_values("hybrid_score", ascending=False).head(top_n)

        # Generate recommendations with match terms and reasons
        recommendations = []
        for idx in top.index:
            # Get module vector for this specific module
            module_vec = self.X[idx]

            terms = self.extract_match_terms(student_vec, module_vec)
            reason = self.build_reason(
                terms,
                module_name=top.at[idx, "name"],
                score=top.at[idx, "similarity"]
            )
            
            recommendation = {
                "id": int(top.at[idx, "id"]),
                "name": str(top.at[idx, "name"]),
                "shortdescription": str(top.at[idx, "shortdescription"]),
                "similarity": float(top.at[idx, "hybrid_score"]),  # Show hybrid score instead of normalized
                "location": str(top.at[idx, "location"]),
                "studycredit": int(top.at[idx, "studycredit"]),
                "level": str(top.at[idx, "level"]),
                "module_tags": str(top.at[idx, "module_tags"]) if pd.notna(top.at[idx, "module_tags"]) else "",
                "match_terms": terms,
                "reason": reason
            }
            recommendations.append(recommendation)

        return {
            "recommendations": recommendations, 
            "total_found": len(recommendations)
        }

    def is_ready(self) -> bool:
        """Check if service is ready."""
        return all([self.df is not None, self.vectorizer is not None, self.X is not None])

    def get_stats(self) -> Dict[str, int]:
        """Get dataset statistics."""
        return {
            "modules_count": len(self.df) if self.df is not None else 0,
            "features_count": len(self.feature_names) if self.feature_names is not None else 0
        }


# Global service instance
recommendation_service = RecommendationService()