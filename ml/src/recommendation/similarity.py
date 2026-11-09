"""
FitMentor AI - Cosine Similarity Scoring Engine
Computes mathematical cosine similarity between 13-D feature vectors.
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import Tuple


def compute_cosine_similarity(user_vec: np.ndarray, workout_vec: np.ndarray) -> Tuple[float, int]:
    """
    Computes cosine similarity between two 13-D vectors.
    
    Formula:
    similarity = dot(user_vec, workout_vec) / (norm(user_vec) * norm(workout_vec))
    
    Returns:
    - raw_score: float in [0.0, 1.0]
    - display_score_percent: int in [0, 100]
    """
    u_norm = np.linalg.norm(user_vec)
    w_norm = np.linalg.norm(workout_vec)
    
    if u_norm == 0.0 or w_norm == 0.0:
        return 0.0, 0
        
    # Reshape for sklearn cosine_similarity
    sim_matrix = cosine_similarity(user_vec.reshape(1, -1), workout_vec.reshape(1, -1))
    raw_score = float(sim_matrix[0, 0])
    
    # Clamp to [0, 1] range to handle float inaccuracies
    raw_score = max(0.0, min(1.0, raw_score))
    display_percent = int(round(raw_score * 100))
    
    return raw_score, display_percent
