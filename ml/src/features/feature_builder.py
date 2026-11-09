"""
FitMentor AI - Feature Builder
High-level interface to extract 13-D feature vectors for users and workout catalogs.
"""

import numpy as np
from typing import Dict, Any, List, Tuple
from ml.src.preprocessing.cleaner import clean_user_profile, clean_workout
from ml.src.preprocessing.encoder import encode_user_profile, encode_workout


def build_user_vector(user_profile: Dict[str, Any]) -> Tuple[Dict[str, Any], np.ndarray]:
    """
    Cleans and builds the 13-D feature vector for a user profile.
    Returns (cleaned_profile, feature_vector).
    """
    cleaned = clean_user_profile(user_profile)
    vector = encode_user_profile(cleaned)
    return cleaned, vector


def build_workout_vectors(workout_catalog: List[Dict[str, Any]]) -> List[Tuple[Dict[str, Any], np.ndarray]]:
    """
    Cleans and builds 13-D feature vectors for a list of workout templates.
    Returns list of (cleaned_workout, feature_vector).
    """
    result = []
    for w in workout_catalog:
        cleaned = clean_workout(w)
        vec = encode_workout(cleaned)
        result.append((cleaned, vec))
    return result
