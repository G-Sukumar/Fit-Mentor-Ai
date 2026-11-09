"""
FitMentor AI - Offline Evaluation Framework
Evaluates recommender coverage, diversity, constraint satisfaction, and distribution
without fabricating ground-truth accuracy metrics.
"""

from typing import Dict, Any, List
import numpy as np
from sklearn.metrics.pairwise import cosine_distances

from ml.src.preprocessing.cleaner import clean_user_profile, clean_workout
from ml.src.preprocessing.encoder import encode_workout
from ml.src.recommendation.recommender import recommend_workouts


def evaluate_recommender(
    sample_user_profiles: List[Dict[str, Any]],
    workout_catalog: List[Dict[str, Any]],
    top_k: int = 5
) -> Dict[str, Any]:
    """
    Evaluates recommendation system performance over a population of sample users.
    
    Reports:
    - total_users_evaluated
    - total_catalog_size
    - catalog_coverage_percent
    - constraint_satisfaction_rate
    - mean_diversity_score
    - top_k_goal_distribution
    - limitation_note
    """
    recommended_workout_ids = set()
    total_recommendations = 0
    valid_constraint_count = 0
    diversity_scores = []
    goal_counts: Dict[str, int] = {}

    for user in sample_user_profiles:
        cleaned_user = clean_user_profile(user)
        res = recommend_workouts(cleaned_user, workout_catalog, top_k=top_k)
        recs = res.get("recommendations", [])
        
        if not recs:
            continue
            
        # Vectors of recommended workouts for diversity calculation
        rec_vectors = []
        for r in recs:
            w_id = r["workoutId"]
            recommended_workout_ids.add(w_id)
            total_recommendations += 1
            
            # Constraint satisfaction check
            u_eq = cleaned_user["available_equipment"]
            u_loc = cleaned_user["workout_location"]
            w_eq = r["equipment"]
            w_loc = r["location"]
            
            satisfies_eq = True
            if u_eq == "BODYWEIGHT" and w_eq in ["DUMBBELLS", "FULL_GYM"]:
                satisfies_eq = False
            elif u_eq == "DUMBBELLS" and w_eq == "FULL_GYM":
                satisfies_eq = False
                
            satisfies_loc = True
            if u_loc == "HOME" and (w_loc == "GYM" or w_eq == "FULL_GYM"):
                satisfies_loc = False
                
            if satisfies_eq and satisfies_loc:
                valid_constraint_count += 1
                
            # Goal distribution
            goal = r["goal"]
            goal_counts[goal] = goal_counts.get(goal, 0) + 1
            
            # Encode for diversity
            cleaned_w = clean_workout(r)
            rec_vectors.append(encode_workout(cleaned_w))
            
        # Diversity: average pairwise cosine distance
        if len(rec_vectors) > 1:
            matrix = np.array(rec_vectors)
            dist_matrix = cosine_distances(matrix)
            # Upper triangle distances
            triu_indices = np.triu_indices_from(dist_matrix, k=1)
            mean_dist = float(np.mean(dist_matrix[triu_indices]))
            diversity_scores.append(mean_dist)

    total_catalog = len(workout_catalog)
    coverage_pct = round((len(recommended_workout_ids) / total_catalog * 100.0), 2) if total_catalog > 0 else 0.0
    constraint_sat_rate = round((valid_constraint_count / total_recommendations * 100.0), 2) if total_recommendations > 0 else 100.0
    mean_diversity = round(float(np.mean(diversity_scores)), 4) if diversity_scores else 0.0

    return {
        "total_users_evaluated": len(sample_user_profiles),
        "total_catalog_size": total_catalog,
        "unique_workouts_recommended": len(recommended_workout_ids),
        "catalog_coverage_percent": coverage_pct,
        "constraint_satisfaction_rate": constraint_sat_rate,
        "mean_diversity_score": mean_diversity,
        "top_k_goal_distribution": goal_counts,
        "limitation_note": (
            "Real historical user click-through and explicit feedback data are not available in this baseline catalog. "
            "Supervised Precision@K and Recall@K accuracy scores are omitted to prevent fabricating non-ground-truth metrics."
        )
    }
