# FitMentor AI — Milestone 5A: Daily Readiness Prediction Model Specification

This document provides the technical problem formulation, dataset audit, feature engineering pipeline, target leakage analysis, model candidate evaluation, temporal validation strategy, and website integration design for the **FitMentor AI Daily Workout Readiness Prediction Engine**.

---

##  STATUS DISTINCTION

> [!IMPORTANT]
> **MILESTONE 5A SPECIFICATION SCOPE**:
> * **DESIGNED & AUDITED**: ML problem formulation, dataset audit, ground-truth target analysis, 14-candidate feature set, temporal feature engineering, Random Forest algorithm selection, time-aware validation strategy, and API contract.
> * **DEFERRED FOR MILESTONE 5B**: Model training execution, Random Forest hyperparameter fitting, model binary artifact persistence (`.joblib`), dashboard UI modifications, and live API endpoint wiring.

---

## 📊 1. Current PostgreSQL Database Readiness Data Audit

An inspection of the relational schema ([001_initial_schema.sql](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/database/migrations/001_initial_schema.sql), [002_onboarding_profile_fields.sql](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/database/migrations/002_onboarding_profile_fields.sql), [003_workout_management.sql](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/database/migrations/003_workout_management.sql)) and live seed records reveals the following field availability:

| Field Name | Table Name | Data Type | Current Record Count | Null % | Example Range | Suitable for ML Pre-Training? |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| `readiness_score` | `daily_biometrics` | `INTEGER` | 0 | 100% | `[0, 100]` (Mock: 85) | ❌ No (Heuristic / Unpopulated) |
| `recovery_score` | `daily_biometrics` | `INTEGER` | 0 | 100% | `[0, 100]` (Mock: 92) | ❌ No (Unpopulated) |
| `sleep_duration_min`| `daily_biometrics` | `INTEGER` | 0 | 100% | `300..540` min | ⚠️ Yes (Requires Telemetry Input) |
| `sleep_score` | `daily_biometrics` | `INTEGER` | 0 | 100% | `50..95` | ⚠️ Yes (Requires Telemetry Input) |
| `resting_hr` | `daily_biometrics` | `INTEGER` | 0 | 100% | `50..85` bpm | ⚠️ Yes (Requires Telemetry Input) |
| `daily_steps` | `daily_biometrics` | `INTEGER` | 0 | 100% | `2,000..18,000` steps | ⚠️ Yes (Requires Telemetry Input) |
| `active_calories` | `daily_biometrics` | `INTEGER` | 0 | 100% | `300..1,200` kcal | ⚠️ Yes (Requires Telemetry Input) |
| `started_at` | `workout_logs` | `TIMESTAMP` | 1 | 0% | ISO Timestamp | ✅ Yes (Session Recency) |
| `total_volume_kg` | `workout_logs` | `NUMERIC` | 1 | 0% | `0..25,000` kg | ✅ Yes (Training Load) |
| `rpe_score` | `workout_logs` | `INTEGER` | 1 | 0% | `1..10` | ✅ Yes (Subjective Fatigue) |
| `fitness_level` | `users` | `VARCHAR` | 1 | 0% | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` | ✅ Yes (Experience Tier) |
| `primary_goal` | `users` | `VARCHAR` | 1 | 0% | 6 Categories | ✅ Yes (Objective Alignment) |

### Audit Finding
> [!WARNING]
> **Data Sparsity Audit Result**: Live production database tables contain **insufficient historical time-series records** ($N=0$ daily biometrics rows) to train a supervised model directly on current DB records without severe overfitting. Baseline model training requires pre-training on an open research dataset aligned with this schema.

---

## 🎯 2. ML Problem Formulation

### Candidate Problem Statement
> **"Predict daily workout readiness from physiological recovery telemetry and historical training load features."**

### Technical Recommendation: Ordinal Classification (3 Tiers) vs Continuous Regression
We recommend formulating the task primarily as **3-Tier Ordinal Classification** (`LOW`, `MODERATE`, `HIGH`), while supporting a continuous $0..100$ probability-weighted score:

- **Classes**:
  - `HIGH` ($\ge 80$): Optimal readiness for heavy compound progressive overload training.
  - `MODERATE` ($50..79$): Standard readiness; maintain volume, avoid RPE 10 failure.
  - `LOW` ($< 50$): Reduced readiness; recommend active recovery, mobility, or deload.

### Rationale
1. **Physiological Noise**: Daily human autonomic recovery is noisy. Predicting an exact continuous scalar (e.g. 83 vs 84) introduces pseudo-precision that does not reflect biological reality.
2. **Actionability**: Athletes make discrete training decisions (Train Heavy vs Modify vs Rest). Ordinal classification directly maps to these decisions.
3. **Robustness to Telemetry Variance**: Classification boundaries are less sensitive to minor wearable calibration drift.

---

## 🔍 3. Ground-Truth Target Variable Audit

### Evaluation of Potential Target Sources

1. **Existing DB `readiness_score`**: ❌ Unpopulated in historical logs; mock endpoint uses a static heuristic formula. Training against this would cause circular self-referential fitting.
2. **App Heuristic Formula**: ❌ Synthetic linear combination; learning this provides zero predictive value.
3. **Public Research Datasets (PMData / LifeSnaps)**: ✅ Contains multi-user daily wearable telemetry (Fitbit sleep, resting HR, activity) paired with daily validated subjective readiness scores (PMC questionnaire).
4. **Subjective Post-Workout RPE / Volume Adherence (Proxy Target)**: ✅ Academically defensible proxy target derived from user workout logs.

### Target Decision
> [!NOTE]
> **Ground-Truth Target Decision**: For baseline model development, ground-truth daily readiness labels will be sourced from **PMData** (PMC daily readiness score mapped to `LOW`, `MODERATE`, `HIGH`), supplemented by FitMentor user session completion/RPE telemetry as live user logs accumulate.

---

## 🛡️ 4. Feature Selection & Target Leakage Analysis

### Target Leakage Rules
1. **Pre-Workout Temporal Boundary**: Features MUST be strictly limited to data available **prior to session initiation** on Day $t$.
2. **No Post-Workout Features**: Completed session volume, post-workout RPE, and post-workout duration on Day $t$ MUST NOT be included when predicting readiness for Day $t$.
3. **No Future Leakage**: Future records ($t+1, t+2$) are strictly excluded from rolling calculations.

### Temporal Prediction Pipeline

```
  [ Day t-7 to t-1 Telemetry ]           [ Day t Morning Telemetry ]
   • Rolling 7d Avg Sleep                 • Previous Night Sleep Duration
   • Rolling 7d Avg Resting HR            • Previous Night Sleep Score
   • 3d / 7d Cumulative Volume            • Morning Resting Heart Rate
   • Days Since Last Session              • Profile Age, Level, Goal
                 │                                      │
                 └──────────────────┬───────────────────┘
                                    │
                                    ▼
                     [ 14-Candidate Feature Vector ]
                                    │
                                    ▼
                    [ Supervised Readiness Model ]
                                    │
                                    ▼
                [ Predicted Readiness: HIGH / MODERATE / LOW ]
                                    │
                                    ▼
                     [ Today's Workout Decision ]
```

---

## 🧪 5. Candidate Feature Specification (14 Features)

| Feature Name | Source Table / Field | Data Type | Expected Relationship | Missing-Value Strategy | Target Leakage Risk? |
| :--- | :--- | :--- | :--- | :--- | :---: |
| `sleep_duration_min` | `daily_biometrics` | Numerical | Positive (More sleep $\rightarrow$ Higher readiness) | Median Imputation (450 min) | ❌ None (Pre-workout) |
| `sleep_score` | `daily_biometrics` | Numerical | Positive | Median Imputation (80) | ❌ None (Pre-workout) |
| `sleep_dev_7d` | Derived (`sleep_duration_min`) | Numerical | Positive (Positive delta vs baseline $\rightarrow$ Higher) | Zero Imputation (0.0) | ❌ None (Historical) |
| `resting_hr` | `daily_biometrics` | Numerical | Negative (Elevated RHR $\rightarrow$ Lower readiness) | Median Imputation (65 bpm) | ❌ None (Pre-workout) |
| `resting_hr_dev_7d` | Derived (`resting_hr`) | Numerical | Negative (Elevated RHR vs baseline $\rightarrow$ Fatigue) | Zero Imputation (0.0) | ❌ None (Historical) |
| `steps_yesterday` | `daily_biometrics` | Numerical | Non-linear (Extreme high $\rightarrow$ Fatigue) | Median Imputation (8,000) | ❌ None (Prior Day) |
| `active_calories_yesterday`| `daily_biometrics` | Numerical | Non-linear | Median Imputation (500) | ❌ None (Prior Day) |
| `volume_3d_kg` | `workout_logs` | Numerical | Negative (High 3d volume $\rightarrow$ Cumulative fatigue)| Zero Imputation (0.0) | ❌ None (Prior Days) |
| `volume_7d_kg` | `workout_logs` | Numerical | Negative | Zero Imputation (0.0) | ❌ None (Prior Days) |
| `avg_rpe_3d` | `workout_logs` | Numerical | Negative (High recent RPE $\rightarrow$ Central fatigue) | Default 7.0 | ❌ None (Prior Sessions) |
| `days_since_last_workout` | Derived (`workout_logs`) | Numerical | Non-linear (1-2 days optimal, >5 detraining) | Default 2 days | ❌ None (Prior Sessions) |
| `age` | `user_profiles` | Numerical | Moderate Negative (Recovery speed) | Default 25 | ❌ None (Static Profile) |
| `fitness_level` | `users` | Ordinal | Positive (Advanced $\rightarrow$ Higher workload capacity)| Mode Imputation (`INTERMEDIATE`)| ❌ None (Static Profile) |
| `activity_level` | `user_profiles` | Ordinal | Non-linear | Mode Imputation (`MODERATELY_ACTIVE`)| ❌ None (Static Profile) |

---

## 🌲 6. Random Forest Model Selection & Algorithm Comparison

### Algorithm Comparison Matrix

| Criterion | Linear / Logistic Regression | Gradient Boosting (XGBoost / LightGBM) | **Random Forest (Recommended)** |
| :--- | :--- | :--- | :--- |
| **Non-Linear Interactions** | ❌ Poor (Requires manual interaction terms) | ✅ Excellent | ✅ **Excellent** |
| **Mixed Feature Types** | ⚠️ Sensitive to scale / encoding | ✅ Robust | ✅ **Native Handling** |
| **Outlier Robustness** | ❌ Sensitive | ⚠️ Moderate (Can overfit outliers) | ✅ **High (Bagging Averaging)** |
| **Small Dataset Performance**| ✅ Good | ⚠️ Prone to Overfitting | ✅ **Resistant to Overfitting** |
| **Interpretability** | ✅ Direct Coefficients | ⚠️ Complex Tree Ensemble | ✅ **Feature Importances (MDI)** |

### Recommendation Rationale
We select **Random Forest** (`RandomForestClassifier` for readiness tier, `RandomForestRegressor` for continuous score) because:
1. It naturally captures complex non-linear fatigue interactions (e.g., high 3-day volume combined with low sleep creates an exponential drop in readiness).
2. Bagging over random subsamples prevents overfitting on small-to-medium telemetry datasets.
3. Provides instant out-of-bag (OOB) error estimates and Mean Decrease in Impurity (MDI) feature importances for user-facing explainability.

---

## 🌐 7. Dataset Strategy (PMData Research Dataset)

### Recommended Strategy: Hybrid Pre-Training
- **Primary Open Dataset**: **PMData** (Sports Medicine & Computer Science Research Dataset, University of Tromsø / Simula).
  - **Contents**: Continuous Fitbit telemetry (sleep duration, sleep stages, resting HR, steps, active calories) and daily subjective PMC readiness/recovery scores across 16 users over 5 months.
  - **License**: Open Academic Research (CC BY 4.0).
  - **Alignment**: Features map 1:1 with FitMentor schema (`sleep_duration_min`, `resting_hr`, `daily_steps`, `active_calories`).

---

## ⏳ 8. Train / Validation / Test Separation Strategy

> [!WARNING]
> Standard random $k$-fold cross-validation causes severe **data leakage** in time-series health telemetry due to autocorrelation across adjacent days.

### Validation Protocols
1. **Time-Aware Chronological Split**:
   - Train Set: First 70% of historical time window.
   - Validation Set: Next 15% of time window.
   - Test Set: Final 15% of time window.
2. **User-Group Separation (`GroupKFold`)**:
   - Splits dataset by `user_id` so no individual user appears in both training and test sets. Tests model generalizability to newly onboarded users.

---

## 📈 9. Evaluation Metrics

### Primary Metric for Classification
- **Macro F1-Score**: Ensures equal weighting across `LOW`, `MODERATE`, and `HIGH` readiness classes, preventing accuracy inflation caused by class imbalance.

### Secondary Metrics
- **Balanced Accuracy**
- **Confusion Matrix**
- **Precision & Recall per class**
- **ROC-AUC (One-vs-Rest)**

---

## 📁 10. Proposed ML Service Architecture (`ml/`)

```
ml/
├── data/
│   ├── raw/
│   │   └── pmdata_readiness.csv
│   └── processed/
│       └── readiness_features.parquet
├── notebooks/
│   ├── 01_content_recommendation_exploration.ipynb
│   └── 02_readiness_eda.ipynb
├── src/
│   ├── preprocessing/
│   │   ├── cleaner.py
│   │   └── encoder.py
│   ├── features/
│   │   └── feature_builder.py
│   ├── recommendation/
│   │   ├── constraints.py
│   │   ├── similarity.py
│   │   └── recommender.py
│   ├── readiness/
│   │   ├── temporal_features.py   # Rolling 7d sleep/HRV/volume builders
│   │   ├── readiness_model.py     # RandomForest Classifier & Regressor wrappers
│   │   └── explainability.py      # Feature importance & factor explanation
│   └── evaluation/
│       └── metrics.py
├── models/
│   ├── encoder.joblib
│   └── readiness_rf_v1.joblib
├── tests/
│   ├── test_recommender.py
│   └── test_readiness_model.py
├── requirements.txt
├── main.py
└── README.md
```

---

## 🔌 11. Website Integration Design & Future API Contract

### Proposed Endpoint
`GET /api/readiness` (Protected JWT Route)

### Example Response Contract
```json
{
  "success": true,
  "score": 85,
  "category": "HIGH",
  "confidence": 0.88,
  "factors": {
    "sleep": { "status": "positive", "detail": "7h 20m (+15m above 7d average)" },
    "restingHeartRate": { "status": "positive", "detail": "62 bpm (stable)" },
    "trainingLoad": { "status": "moderate", "detail": "Cumulative 7d volume 14,200kg" }
  },
  "aiBriefing": "Your autonomic nervous system recovery is high. You are in optimal condition for progressive overload training today."
}
```

---

## 💡 12. Explainability Strategy

To explain why readiness changed without adding heavy runtime SHAP overhead:
1. **Global Importance**: Extracted via Random Forest MDI (`feature_importances_`).
2. **Local Instance Explanation**: Calculated from personal baseline deltas:
   - Positive Factor: `sleep_dev_7d > 0` or `resting_hr_dev_7d < 0`.
   - Negative Factor: `sleep_dev_7d < -45 min` or `volume_3d_kg > 20,000 kg`.
