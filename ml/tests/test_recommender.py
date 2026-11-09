"""
FitMentor AI - Recommender Suite Unit Tests
Implements mandatory test cases (TEST 1 to TEST 8) specified in Milestone 4.
"""

import os
import json
import pytest
from ml.src.recommendation.recommender import recommend_workouts
from ml.src.preprocessing.cleaner import clean_user_profile

CATALOG_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "workouts_catalog.json")


@pytest.fixture
def catalog():
    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_1_hypertrophy_intermediate_gym(catalog):
    user = {
        "primary_goal": "HYPERTROPHY",
        "fitness_level": "INTERMEDIATE",
        "available_equipment": "FULL_GYM",
        "workout_location": "GYM",
        "preferred_duration_min": 60
    }
    res = recommend_workouts(user, catalog, top_k=5)
    assert res["success"] is True
    recs = res["recommendations"]
    assert len(recs) > 0
    top = recs[0]
    assert top["goal"] == "HYPERTROPHY"
    assert top["equipment"] == "FULL_GYM"
    assert top["matchPercentage"] >= 80


def test_2_fat_loss_beginner_home_bodyweight(catalog):
    user = {
        "primary_goal": "FAT_LOSS",
        "fitness_level": "BEGINNER",
        "available_equipment": "BODYWEIGHT",
        "workout_location": "HOME",
        "preferred_duration_min": 30
    }
    res = recommend_workouts(user, catalog, top_k=5)
    assert res["success"] is True
    recs = res["recommendations"]
    assert len(recs) > 0
    top = recs[0]
    assert top["goal"] == "FAT_LOSS"
    assert top["equipment"] == "BODYWEIGHT"
    assert top["location"] == "HOME"


def test_3_equipment_bodyweight_excludes_full_gym(catalog):
    user = {
        "primary_goal": "HYPERTROPHY",
        "fitness_level": "ADVANCED",
        "available_equipment": "BODYWEIGHT",
        "workout_location": "HOME",
        "preferred_duration_min": 60
    }
    res = recommend_workouts(user, catalog, top_k=10)
    for rec in res["recommendations"]:
        assert rec["equipment"] != "FULL_GYM"
        assert rec["equipment"] != "DUMBBELLS"
        assert rec["equipment"] == "BODYWEIGHT"


def test_4_location_home_excludes_gym_only(catalog):
    user = {
        "primary_goal": "STRENGTH",
        "fitness_level": "ADVANCED",
        "available_equipment": "BODYWEIGHT",
        "workout_location": "HOME",
        "preferred_duration_min": 60
    }
    res = recommend_workouts(user, catalog, top_k=10)
    for rec in res["recommendations"]:
        assert rec["location"] != "GYM"


def test_5_goal_change_alters_recommendations(catalog):
    user_hypertrophy = {
        "primary_goal": "HYPERTROPHY",
        "fitness_level": "INTERMEDIATE",
        "available_equipment": "FULL_GYM",
        "workout_location": "GYM",
        "preferred_duration_min": 60
    }
    user_endurance = {
        "primary_goal": "ENDURANCE",
        "fitness_level": "INTERMEDIATE",
        "available_equipment": "FULL_GYM",
        "workout_location": "GYM",
        "preferred_duration_min": 60
    }
    res_hyp = recommend_workouts(user_hypertrophy, catalog, top_k=3)
    res_end = recommend_workouts(user_endurance, catalog, top_k=3)
    
    top_hyp_ids = [r["workoutId"] for r in res_hyp["recommendations"]]
    top_end_ids = [r["workoutId"] for r in res_end["recommendations"]]
    assert top_hyp_ids != top_end_ids
    assert res_end["recommendations"][0]["goal"] == "ENDURANCE"


def test_6_duration_preference_influences_ranking(catalog):
    user_short = {
        "primary_goal": "HYPERTROPHY",
        "fitness_level": "INTERMEDIATE",
        "available_equipment": "FULL_GYM",
        "workout_location": "GYM",
        "preferred_duration_min": 30
    }
    user_long = {
        "primary_goal": "HYPERTROPHY",
        "fitness_level": "INTERMEDIATE",
        "available_equipment": "FULL_GYM",
        "workout_location": "GYM",
        "preferred_duration_min": 90
    }
    res_short = recommend_workouts(user_short, catalog, top_k=3)
    res_long = recommend_workouts(user_long, catalog, top_k=3)
    
    assert res_short["recommendations"][0]["duration"] <= res_long["recommendations"][0]["duration"]


def test_7_missing_profile_fields_handled_safely(catalog):
    user_incomplete = {
        "primary_goal": None,
        "fitness_level": ""
    }
    cleaned = clean_user_profile(user_incomplete)
    assert cleaned["primary_goal"] == "GENERAL_FITNESS"
    assert cleaned["fitness_level"] == "INTERMEDIATE"
    assert cleaned["available_equipment"] == "FULL_GYM"
    assert cleaned["workout_location"] == "GYM"
    assert cleaned["preferred_duration_min"] == 60
    
    res = recommend_workouts(user_incomplete, catalog, top_k=5)
    assert res["success"] is True
    assert len(res["recommendations"]) > 0


def test_8_no_compatible_workouts_handled_gracefully():
    user = {
        "primary_goal": "HYPERTROPHY",
        "fitness_level": "INTERMEDIATE",
        "available_equipment": "BODYWEIGHT",
        "workout_location": "HOME",
        "preferred_duration_min": 60
    }
    # Artificial catalog containing only FULL_GYM workouts
    gym_only_catalog = [
        {
            "id": "w_gym_01",
            "title": "Gym Heavy Press",
            "targetGoal": "HYPERTROPHY",
            "difficulty": "INTERMEDIATE",
            "equipment": "FULL_GYM",
            "location": "GYM",
            "durationEstMin": 60
        }
    ]
    res = recommend_workouts(user, gym_only_catalog, top_k=5)
    assert res["success"] is True
    assert res["count"] == 0
    assert len(res["recommendations"]) == 0
    assert "No compatible" in res["message"]
