"""
FitMentor AI - Main Recommender Orchestrator
Processes user profiles, executes hard constraints, computes 13-D cosine similarity,
sorts Top-K recommendations, and generates natural language explanations.
"""

from typing import Dict, Any, List
import numpy as np

from ml.src.preprocessing.cleaner import clean_user_profile, clean_workout
from ml.src.preprocessing.encoder import encode_user_profile, encode_workout
from ml.src.recommendation.constraints import is_workout_eligible
from ml.src.recommendation.similarity import compute_cosine_similarity


def generate_explanation(
    match_percent: int,
    user_profile: Dict[str, Any],
    workout: Dict[str, Any]
) -> str:
    """
    Generates a natural language explanation strictly from actual matching features.
    Does NOT invent reasons if the feature does not match.
    """
    matched_reasons = []
    
    # 1. Goal Match
    u_goal = user_profile.get("primary_goal")
    w_goal = workout.get("target_goal")
    if u_goal == w_goal:
        goal_labels = {
            "HYPERTROPHY": "muscle-gain goal",
            "FAT_LOSS": "fat-loss goal",
            "STRENGTH": "strength goal",
            "ENDURANCE": "endurance goal",
            "GENERAL_FITNESS": "general fitness goal",
            "RECOVERY": "recovery goal"
        }
        matched_reasons.append(f"{goal_labels.get(u_goal, 'fitness goal')}")
        
    # 2. Fitness Level Match
    u_level = user_profile.get("fitness_level")
    w_level = workout.get("difficulty_level")
    if u_level == w_level:
        matched_reasons.append(f"{u_level.lower()} fitness level")
        
    # 3. Equipment Match
    u_eq = user_profile.get("available_equipment")
    w_eq = workout.get("equipment_required")
    if u_eq == w_eq:
        eq_labels = {
            "FULL_GYM": "gym equipment",
            "DUMBBELLS": "dumbbell setup",
            "BODYWEIGHT": "bodyweight equipment"
        }
        matched_reasons.append(f"{eq_labels.get(u_eq, 'equipment')}")
        
    # 4. Location Match
    u_loc = user_profile.get("workout_location")
    w_loc = workout.get("workout_location")
    if u_loc == w_loc:
        loc_labels = {
            "GYM": "gym location",
            "HOME": "home environment"
        }
        matched_reasons.append(f"{loc_labels.get(u_loc, 'location')}")
        
    # 5. Duration Proximity Match (within 15 min)
    u_dur = user_profile.get("preferred_duration_min", 60)
    w_dur = workout.get("duration_est_min", 60)
    if abs(u_dur - w_dur) <= 15:
        matched_reasons.append(f"preferred {w_dur}-minute duration")
        
    if not matched_reasons:
        return f"{match_percent}% match based on custom feature compatibility."
        
    if len(matched_reasons) == 1:
        reasons_str = matched_reasons[0]
    elif len(matched_reasons) == 2:
        reasons_str = f"{matched_reasons[0]} and {matched_reasons[1]}"
    else:
        reasons_str = ", ".join(matched_reasons[:-1]) + f", and {matched_reasons[-1]}"
        
    return f"{match_percent}% match because this workout matches your {reasons_str}."


def recommend_workouts(
    user_profile: Dict[str, Any],
    workout_catalog: List[Dict[str, Any]],
    top_k: int = 5
) -> Dict[str, Any]:
    """
    Main recommendation engine function.
    
    Returns a dict with:
    - success: bool
    - count: int
    - recommendations: list of ranked workout dicts
    - message: str (explanation if empty or successful)
    """
    cleaned_user = clean_user_profile(user_profile)
    user_vec = encode_user_profile(cleaned_user)
    
    scored_workouts = []
    
    for raw_w in workout_catalog:
        cleaned_w = clean_workout(raw_w)
        
        # 1. Apply Hard Constraints
        if not is_workout_eligible(cleaned_user, cleaned_w):
            continue
            
        # 2. Vector Encoding & Cosine Similarity
        w_vec = encode_workout(cleaned_w)
        raw_score, match_percent = compute_cosine_similarity(user_vec, w_vec)
        
        # 3. Generate Natural Language Explanation
        explanation = generate_explanation(match_percent, cleaned_user, cleaned_w)
        
        rec_item = {
            "workoutId": raw_w.get("id") or raw_w.get("workoutId") or cleaned_w.get("id", "w_unk"),
            "name": raw_w.get("name") or raw_w.get("title") or "Workout Routine",
            "title": raw_w.get("title") or raw_w.get("name") or "Workout Routine",
            "score": round(raw_score, 4),
            "matchPercentage": match_percent,
            "goal": cleaned_w["target_goal"],
            "difficulty": cleaned_w["difficulty_level"],
            "equipment": cleaned_w["equipment_required"],
            "location": cleaned_w["workout_location"],
            "duration": cleaned_w["duration_est_min"],
            "explanation": explanation
        }
        scored_workouts.append(rec_item)
        
    # 4. Handle Empty Recommendation Set
    if not scored_workouts:
        return {
            "success": True,
            "count": 0,
            "recommendations": [],
            "message": "No compatible workouts found matching your equipment and location constraints."
        }
        
    # 5. Sort Descending by Score
    scored_workouts.sort(key=lambda x: x["score"], reverse=True)
    top_recommendations = scored_workouts[:top_k]
    
    return {
        "success": True,
        "count": len(top_recommendations),
        "recommendations": top_recommendations,
        "message": f"Successfully retrieved top {len(top_recommendations)} recommendations."
    }
