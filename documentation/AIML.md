# FitMentor AI — AIML Workout Recommendation Engine Specification

This document details the complete architectural design, feature engineering specification, vector space correction rationale, evaluation results, and API integration for the **FitMentor AI Content-Based Workout Recommendation System**.

---

## 🎯 1. Problem Definition & Architectural Correction

### Problem Statement
> **"Given an authenticated user's fitness profile, physical parameters, experience level, available equipment, workout location, and target duration, filter out incompatible routines via hard constraints and rank the eligible workout catalog using cosine similarity over a joint feature space."**

### Architectural Vector Space Correction Rationale
> [!IMPORTANT]
> **Vector Space Correction**: The previous draft specification proposed a 15-dimensional user vector ($\mathbf{u} \in \mathbb{R}^{15}$) and a 20-dimensional workout vector ($\mathbf{w} \in \mathbb{R}^{20}$). Cosine similarity mathematically requires vectors of identical dimensionality:
> 
> $$\text{Cosine Similarity}(\mathbf{u}, \mathbf{w}) = \frac{\mathbf{u} \cdot \mathbf{w}}{\|\mathbf{u}\|_2 \|\mathbf{w}\|_2}$$
> 
> Direct dot product operations between mismatched $\mathbb{R}^{15}$ and $\mathbb{R}^{20}$ spaces are impossible. Therefore, Milestone 4 replaces the 15-vs-20 dimensional design with a **shared 13-dimensional compatibility feature space** ($\mathbf{u}, \mathbf{w} \in \mathbb{R}^{13}$) with identical feature ordering.

---

## 📐 2. Shared 13-Dimensional Cosine Feature Vector Space

Both the User Feature Vector ($\mathbf{u}$) and Workout Feature Vector ($\mathbf{w}$) are encoded into an identical 13-dimensional feature vector.

### Exact Feature Vector Ordering (13 Dimensions)

| Dimension Index | Feature Identifier | Data Type | Encoding Strategy & Value Ranges | Rationale |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `GOAL_HYPERTROPHY` | Binary | $\{0.0, 1.0\}$ One-Hot | Muscle hypertrophy goal alignment |
| **2** | `GOAL_FAT_LOSS` | Binary | $\{0.0, 1.0\}$ One-Hot | Fat loss & weight management alignment |
| **3** | `GOAL_STRENGTH` | Binary | $\{0.0, 1.0\}$ One-Hot | Pure strength & power alignment |
| **4** | `GOAL_ENDURANCE` | Binary | $\{0.0, 1.0\}$ One-Hot | Stamina & cardiovascular endurance alignment |
| **5** | `GOAL_GENERAL_FITNESS` | Binary | $\{0.0, 1.0\}$ One-Hot | General health & well-being alignment |
| **6** | `GOAL_RECOVERY` | Binary | $\{0.0, 1.0\}$ One-Hot | Active recovery & joint mobility alignment |
| **7** | `FITNESS_LEVEL_OR_DIFFICULTY` | Ordinal | MinMax Scaled: `BEGINNER` = 0.0, `INTERMEDIATE` = 0.5, `ADVANCED` = 1.0 | Experience and intensity capacity rating |
| **8** | `EQUIPMENT_FULL_GYM` | Binary | $\{0.0, 1.0\}$ One-Hot | Full commercial gym equipment requirement |
| **9** | `EQUIPMENT_DUMBBELLS` | Binary | $\{0.0, 1.0\}$ One-Hot | Home/gym dumbbell equipment requirement |
| **10**| `EQUIPMENT_BODYWEIGHT` | Binary | $\{0.0, 1.0\}$ One-Hot | Calisthenics / bodyweight requirement |
| **11**| `LOCATION_GYM` | Binary | $\{0.0, 1.0\}$ One-Hot | Commercial gym facility requirement |
| **12**| `LOCATION_HOME` | Binary | $\{0.0, 1.0\}$ One-Hot | Home environment requirement |
| **13**| `DURATION_SCALED` | Numerical | MinMax Scaled: $\frac{\text{duration} - 30}{90 - 30} \in [0.0, 1.0]$ | Time availability alignment |

---

## ⛔ 3. Hard Constraint Filtering Rules

To prevent unsafe or impossible recommendations (e.g. recommending barbell squat routines to a user with bodyweight-only home setup), hard constraint filtering is applied **prior** to vector scoring:

1. **Equipment Filter**:
   - User Equipment = `BODYWEIGHT` $\rightarrow$ Exclude `DUMBBELLS` and `FULL_GYM` workouts.
   - User Equipment = `DUMBBELLS` $\rightarrow$ Exclude `FULL_GYM` workouts.
   - User Equipment = `FULL_GYM` $\rightarrow$ Eligible for `FULL_GYM`, `DUMBBELLS`, or `BODYWEIGHT` workouts.
2. **Location Filter**:
   - User Location = `HOME` $\rightarrow$ Exclude `GYM`-only and `FULL_GYM` workouts.
   - User Location = `GYM` $\rightarrow$ Eligible for both `GYM` and `HOME` workouts.

If no eligible workouts pass hard constraint filtering, the recommender returns a clear response indicating that no compatible workout was found.

---

## ⚙️ 4. End-to-End Recommendation Pipeline Architecture

```
                 [ Authenticated User Profile ]
                              │
                              ▼
                1. PREPROCESSING & CLEANING
    (Sanitize strings, impute safe defaults for NULL values)
                              │
                              ▼
                2. HARD CONSTRAINT FILTERING
     (Mask out incompatible equipment & location workouts)
                              │
                              ▼
                3. 13-D VECTOR ENCODING
     (Encode User Vector u and Workout Vectors w into R^13)
                              │
                              ▼
                4. COSINE SIMILARITY ENGINE
        (Compute Sim(u, w) = (u · w) / (||u||_2 ||w||_2))
                              │
                              ▼
                5. TOP-K SORTING & EXPLAINABILITY
    (Sort descending, select Top 5, generate natural explanations)
```

---

## 🗣️ 5. Explainability Generator

Explanations are generated deterministically from **actual matching features**:

* **Example**:
  > *"92% match because this workout matches your muscle-gain goal, intermediate fitness level, gym equipment and preferred 60-minute duration."*

Features that do not match are strictly excluded from the natural language explanation string.

---

## 📊 6. Evaluation Framework & Results

Because production click-through data is not available, precision/recall metrics are omitted to prevent fabricating non-ground-truth scores. The evaluation suite evaluates distribution and coverage:

| Metric | Result Value | Description |
| :--- | :--- | :--- |
| **Evaluated User Profiles** | 5 test personas | Representative test population covering all goal/level tiers |
| **Catalog Size** | 15 templates | Diverse catalog across goals, equipment, locations, and durations |
| **Catalog Coverage** | **86.67%** | 13 out of 15 workouts recommended across test population |
| **Constraint Satisfaction Rate** | **100.0%** | Zero hard-constraint violations |
| **Mean Diversity Score** | **0.0597** | Average pairwise cosine distance among Top-K recommendations |
| **Unit Test Coverage** | **8 / 8 Passed (100%)** | All 8 required test scenarios verified via `pytest` |

---

## 🛠️ 7. Python Sub-Service Folder Structure (`ml/`)

```
ml/
├── data/
│   └── workouts_catalog.json   # 15 realistic workout templates
├── notebooks/
│   └── 01_exploration.ipynb
├── src/
│   ├── preprocessing/
│   │   ├── cleaner.py          # Data cleaner and default imputations
│   │   └── encoder.py          # 13-D Feature vector encoder
│   ├── features/
│   │   └── feature_builder.py  # Feature vector pipeline
│   ├── recommendation/
│   │   ├── constraints.py      # Hard constraint mask filters
│   │   ├── similarity.py       # Cosine similarity math engine
│   │   └── recommender.py      # Recommender orchestrator & explainability
│   └── evaluation/
│       └── metrics.py          # Coverage, diversity, constraint evaluation
├── models/
├── tests/
│   └── test_recommender.py     # 8 unit test cases (TEST 1 to TEST 8)
├── requirements.txt            # numpy, pandas, scikit-learn, pytest
├── main.py                     # CLI / IPC runner
└── README.md                   # Service documentation
```

---

## 🔗 8. Backend & Frontend Integration

- **Backend Route**: `GET /api/recommendations/workouts`
- **Controller**: `getWorkoutRecommendations` in `backend/src/controllers/workouts.controller.ts`
- **Frontend Component**: `RecommendedWorkouts.tsx` embedded in `Dashboard.tsx` displaying match percentage badges, tags, natural language explanation, and "Start Workout" action button.
