# FitMentor AI — AIML Recommendation Engine Service

This directory contains the Python sub-service for the **Content-Based Workout Recommendation System** using **Cosine Similarity** over a **shared 13-dimensional feature space**.

## Architecture Overview

### Shared 13-Dimensional Cosine Feature Vector Space
The user vector and workout vector share an identical 13-feature ordering:

| Dimension Index | Feature Name | Encoding Strategy |
| :---: | :--- | :--- |
| **1** | `GOAL_HYPERTROPHY` | One-Hot Encoding |
| **2** | `GOAL_FAT_LOSS` | One-Hot Encoding |
| **3** | `GOAL_STRENGTH` | One-Hot Encoding |
| **4** | `GOAL_ENDURANCE` | One-Hot Encoding |
| **5** | `GOAL_GENERAL_FITNESS` | One-Hot Encoding |
| **6** | `GOAL_RECOVERY` | One-Hot Encoding |
| **7** | `FITNESS_LEVEL_OR_DIFFICULTY` | Ordinal: `BEGINNER`=0.0, `INTERMEDIATE`=0.5, `ADVANCED`=1.0 |
| **8** | `EQUIPMENT_FULL_GYM` | One-Hot Encoding |
| **9** | `EQUIPMENT_DUMBBELLS` | One-Hot Encoding |
| **10**| `EQUIPMENT_BODYWEIGHT` | One-Hot Encoding |
| **11**| `LOCATION_GYM` | One-Hot Encoding |
| **12**| `LOCATION_HOME` | One-Hot Encoding |
| **13**| `DURATION_SCALED` | MinMax Scaled: `(duration - 30) / 60` |

### Hard Constraints
Applied before scoring:
- **Equipment Constraint**: Bodyweight users cannot be matched with Dumbbell or Full Gym routines. Dumbbell users cannot be matched with Full Gym routines.
- **Location Constraint**: Home users cannot be matched with Gym-only routines.

### Cosine Similarity & Natural Language Explainability
Scores are calculated via matrix dot product over norms using `scikit-learn`. Recommendations generate deterministic natural language explanations matching exact matched features.

## Execution & Testing

```bash
# Run unit tests
pytest ml/tests/test_recommender.py

# Run offline evaluation metrics
python ml/main.py --evaluate
```
