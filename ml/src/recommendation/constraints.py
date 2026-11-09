"""
FitMentor AI - Hard Constraint Filter
Applies strict logistical and physical filters BEFORE cosine similarity scoring.
"""

from typing import Dict, Any, List


def is_workout_eligible(user_profile: Dict[str, Any], workout: Dict[str, Any]) -> bool:
    """
    Evaluates hard constraints between a cleaned user profile and a cleaned workout template.
    Returns True if workout passes all constraints; False otherwise.
    """
    user_eq = user_profile.get("available_equipment", "FULL_GYM")
    user_loc = user_profile.get("workout_location", "GYM")
    
    workout_eq = workout.get("equipment_required", "FULL_GYM")
    workout_loc = workout.get("workout_location", "GYM")
    
    # 1. Equipment Constraint Filter
    if user_eq == "BODYWEIGHT":
        # Bodyweight users cannot access Dumbbell or Full Gym workouts
        if workout_eq in ["DUMBBELLS", "FULL_GYM"]:
            return False
    elif user_eq == "DUMBBELLS":
        # Dumbbell users cannot access Full Gym workouts
        if workout_eq == "FULL_GYM":
            return False
            
    # 2. Location Constraint Filter
    if user_loc == "HOME":
        # Home users cannot do gym-only / full gym workouts
        if workout_loc == "GYM" or workout_eq == "FULL_GYM":
            return False
            
    return True


def filter_eligible_workouts(
    user_profile: Dict[str, Any], 
    workout_catalog: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Filters a catalog of cleaned workouts, returning only those satisfying hard constraints.
    """
    eligible = []
    for w in workout_catalog:
        if is_workout_eligible(user_profile, w):
            eligible.append(w)
    return eligible
