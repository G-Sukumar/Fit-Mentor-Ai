"""
FitMentor AI - ML Service Main Entry Point
CLI / IPC wrapper for invoking recommendation engine from Node backend or direct command line.
"""

import sys
import json
import os
from typing import Dict, Any, List

# Add parent directory to sys.path for standalone imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.src.recommendation.recommender import recommend_workouts
from ml.src.evaluation.metrics import evaluate_recommender

DEFAULT_CATALOG_PATH = os.path.join(os.path.dirname(__file__), "data", "workouts_catalog.json")


def load_catalog(path: str = DEFAULT_CATALOG_PATH) -> List[Dict[str, Any]]:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--evaluate":
        # Run Evaluation Suite
        catalog = load_catalog()
        sample_users = [
            {"primary_goal": "HYPERTROPHY", "fitness_level": "INTERMEDIATE", "available_equipment": "FULL_GYM", "workout_location": "GYM", "preferred_duration_min": 60},
            {"primary_goal": "FAT_LOSS", "fitness_level": "BEGINNER", "available_equipment": "BODYWEIGHT", "workout_location": "HOME", "preferred_duration_min": 30},
            {"primary_goal": "STRENGTH", "fitness_level": "ADVANCED", "available_equipment": "FULL_GYM", "workout_location": "GYM", "preferred_duration_min": 90},
            {"primary_goal": "ENDURANCE", "fitness_level": "INTERMEDIATE", "available_equipment": "DUMBBELLS", "workout_location": "HOME", "preferred_duration_min": 45},
            {"primary_goal": "RECOVERY", "fitness_level": "BEGINNER", "available_equipment": "BODYWEIGHT", "workout_location": "HOME", "preferred_duration_min": 30}
        ]
        results = evaluate_recommender(sample_users, catalog)
        print(json.dumps(results, indent=2))
        return

    # Read user profile and optional catalog from stdin JSON
    try:
        input_data = json.load(sys.stdin)
        user_profile = input_data.get("user_profile") or input_data.get("user") or {}
        catalog = input_data.get("catalog") or load_catalog()
        top_k = int(input_data.get("top_k", 5))
    except Exception:
        # Fallback default test user
        user_profile = {
            "primary_goal": "HYPERTROPHY",
            "fitness_level": "INTERMEDIATE",
            "available_equipment": "FULL_GYM",
            "workout_location": "GYM",
            "preferred_duration_min": 60
        }
        catalog = load_catalog()
        top_k = 5

    res = recommend_workouts(user_profile, catalog, top_k=top_k)
    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
