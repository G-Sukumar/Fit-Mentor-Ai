"""
FitMentor AI - Preprocessing Data Cleaner
Sanitizes user profile and workout data, imputing safe defaults for missing or null values.
"""

from typing import Dict, Any

VALID_GOALS = ["HYPERTROPHY", "FAT_LOSS", "STRENGTH", "ENDURANCE", "GENERAL_FITNESS", "RECOVERY"]
VALID_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
VALID_EQUIPMENT = ["FULL_GYM", "DUMBBELLS", "BODYWEIGHT"]
VALID_LOCATIONS = ["GYM", "HOME"]


def clean_user_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cleans and standardizes a user profile dict with safe fallback defaults.
    """
    cleaned = dict(profile or {})
    
    # Primary Goal
    goal = str(cleaned.get("primary_goal") or cleaned.get("primaryGoal") or "GENERAL_FITNESS").upper()
    if goal not in VALID_GOALS:
        goal = "GENERAL_FITNESS"
    cleaned["primary_goal"] = goal
    
    # Fitness Level
    level = str(cleaned.get("fitness_level") or cleaned.get("fitnessLevel") or "INTERMEDIATE").upper()
    if level not in VALID_LEVELS:
        level = "INTERMEDIATE"
    cleaned["fitness_level"] = level
    
    # Available Equipment
    eq = str(cleaned.get("available_equipment") or cleaned.get("availableEquipment") or "FULL_GYM").upper()
    if eq not in VALID_EQUIPMENT:
        eq = "FULL_GYM"
    cleaned["available_equipment"] = eq
    
    # Workout Location
    loc = str(cleaned.get("workout_location") or cleaned.get("workoutLocation") or "GYM").upper()
    if loc not in VALID_LOCATIONS:
        loc = "GYM"
    cleaned["workout_location"] = loc
    
    # Preferred Duration (min 30, max 90, default 60)
    try:
        dur = int(cleaned.get("preferred_duration_min") or cleaned.get("preferredDurationMin") or 60)
    except (ValueError, TypeError):
        dur = 60
    dur = max(30, min(90, dur))
    cleaned["preferred_duration_min"] = dur
    
    return cleaned


def clean_workout(workout: Dict[str, Any]) -> Dict[str, Any]:
    """
    Cleans and standardizes a workout template dict with safe fallback defaults.
    """
    cleaned = dict(workout or {})
    
    # Target Goal
    goal = str(cleaned.get("target_goal") or cleaned.get("targetGoal") or cleaned.get("category") or "GENERAL_FITNESS").upper()
    if goal not in VALID_GOALS:
        # Map common category names if goal not explicitly matched
        goal_upper = goal.upper()
        if "HYPERTROPHY" in goal_upper or "BUILD" in goal_upper or "MUSCLE" in goal_upper:
            goal = "HYPERTROPHY"
        elif "FAT" in goal_upper or "LOSS" in goal_upper or "HIIT" in goal_upper:
            goal = "FAT_LOSS"
        elif "STRENGTH" in goal_upper or "POWER" in goal_upper:
            goal = "STRENGTH"
        elif "ENDURANCE" in goal_upper or "STAMINA" in goal_upper or "CARDIO" in goal_upper:
            goal = "ENDURANCE"
        elif "RECOVERY" in goal_upper or "MOBILITY" in goal_upper or "STRETCH" in goal_upper:
            goal = "RECOVERY"
        else:
            goal = "GENERAL_FITNESS"
    cleaned["target_goal"] = goal
    
    # Difficulty / Level
    level = str(cleaned.get("difficulty_level") or cleaned.get("difficulty") or "INTERMEDIATE").upper()
    if level not in VALID_LEVELS:
        level = "INTERMEDIATE"
    cleaned["difficulty_level"] = level
    
    # Equipment Required
    eq = str(cleaned.get("equipment_required") or cleaned.get("equipment") or "FULL_GYM").upper()
    if eq not in VALID_EQUIPMENT:
        eq = "FULL_GYM"
    cleaned["equipment_required"] = eq
    
    # Workout Location
    loc = str(cleaned.get("workout_location") or cleaned.get("location") or "").upper()
    if loc not in VALID_LOCATIONS:
        # Fallback mapping from equipment
        if eq == "FULL_GYM":
            loc = "GYM"
        else:
            loc = "HOME"
    cleaned["workout_location"] = loc
    
    # Duration (min 30, max 90, default 60)
    try:
        dur = int(cleaned.get("duration_est_min") or cleaned.get("durationEstMin") or 60)
    except (ValueError, TypeError):
        dur = 60
    dur = max(30, min(90, dur))
    cleaned["duration_est_min"] = dur
    
    return cleaned
