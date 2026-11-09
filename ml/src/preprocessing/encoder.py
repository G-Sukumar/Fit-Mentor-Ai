"""
FitMentor AI - Feature Vector Encoder
Encodes user profiles and workout templates into a shared 13-dimensional feature space.

EXACT FEATURE ORDERING (13 Dimensions):
1. GOAL_HYPERTROPHY
2. GOAL_FAT_LOSS
3. GOAL_STRENGTH
4. GOAL_ENDURANCE
5. GOAL_GENERAL_FITNESS
6. GOAL_RECOVERY
7. FITNESS_LEVEL / DIFFICULTY (BEGINNER=0.0, INTERMEDIATE=0.5, ADVANCED=1.0)
8. EQUIPMENT_FULL_GYM
9. EQUIPMENT_DUMBBELLS
10. EQUIPMENT_BODYWEIGHT
11. LOCATION_GYM
12. LOCATION_HOME
13. DURATION_SCALED (MinMax scaled from 30..90 min)
"""

import numpy as np
from typing import Dict, Any, List

FEATURE_DIMENSIONS = [
    "GOAL_HYPERTROPHY",
    "GOAL_FAT_LOSS",
    "GOAL_STRENGTH",
    "GOAL_ENDURANCE",
    "GOAL_GENERAL_FITNESS",
    "GOAL_RECOVERY",
    "FITNESS_LEVEL_OR_DIFFICULTY",
    "EQUIPMENT_FULL_GYM",
    "EQUIPMENT_DUMBBELLS",
    "EQUIPMENT_BODYWEIGHT",
    "LOCATION_GYM",
    "LOCATION_HOME",
    "DURATION_SCALED"
]

GOAL_MAP = {
    "HYPERTROPHY": 0,
    "FAT_LOSS": 1,
    "STRENGTH": 2,
    "ENDURANCE": 3,
    "GENERAL_FITNESS": 4,
    "RECOVERY": 5
}

LEVEL_MAP = {
    "BEGINNER": 0.0,
    "INTERMEDIATE": 0.5,
    "ADVANCED": 1.0
}

EQUIPMENT_MAP = {
    "FULL_GYM": 7,
    "DUMBBELLS": 8,
    "BODYWEIGHT": 9
}

LOCATION_MAP = {
    "GYM": 10,
    "HOME": 11
}


def encode_user_profile(cleaned_profile: Dict[str, Any]) -> np.ndarray:
    """
    Encodes a cleaned user profile into a 13-D numpy feature vector.
    """
    vec = np.zeros(13, dtype=np.float64)
    
    # 1-6: Goal One-Hot
    goal = cleaned_profile.get("primary_goal", "GENERAL_FITNESS")
    goal_idx = GOAL_MAP.get(goal, 4)
    vec[goal_idx] = 1.0
    
    # 7: Fitness Level Ordinal
    level = cleaned_profile.get("fitness_level", "INTERMEDIATE")
    vec[6] = LEVEL_MAP.get(level, 0.5)
    
    # 8-10: Equipment One-Hot
    eq = cleaned_profile.get("available_equipment", "FULL_GYM")
    eq_idx = EQUIPMENT_MAP.get(eq, 7)
    vec[eq_idx] = 1.0
    
    # 11-12: Location One-Hot
    loc = cleaned_profile.get("workout_location", "GYM")
    loc_idx = LOCATION_MAP.get(loc, 10)
    vec[loc_idx] = 1.0
    
    # 13: Duration MinMax Scaled [30..90]
    dur = float(cleaned_profile.get("preferred_duration_min", 60))
    vec[12] = max(0.0, min(1.0, (dur - 30.0) / 60.0))
    
    return vec


def encode_workout(cleaned_workout: Dict[str, Any]) -> np.ndarray:
    """
    Encodes a cleaned workout template into a 13-D numpy feature vector.
    """
    vec = np.zeros(13, dtype=np.float64)
    
    # 1-6: Target Goal One-Hot
    goal = cleaned_workout.get("target_goal", "GENERAL_FITNESS")
    goal_idx = GOAL_MAP.get(goal, 4)
    vec[goal_idx] = 1.0
    
    # 7: Difficulty Level Ordinal
    level = cleaned_workout.get("difficulty_level", "INTERMEDIATE")
    vec[6] = LEVEL_MAP.get(level, 0.5)
    
    # 8-10: Equipment Required One-Hot
    eq = cleaned_workout.get("equipment_required", "FULL_GYM")
    eq_idx = EQUIPMENT_MAP.get(eq, 7)
    vec[eq_idx] = 1.0
    
    # 11-12: Location One-Hot
    loc = cleaned_workout.get("workout_location", "GYM")
    loc_idx = LOCATION_MAP.get(loc, 10)
    vec[loc_idx] = 1.0
    
    # 13: Duration MinMax Scaled [30..90]
    dur = float(cleaned_workout.get("duration_est_min", 60))
    vec[12] = max(0.0, min(1.0, (dur - 30.0) / 60.0))
    
    return vec
