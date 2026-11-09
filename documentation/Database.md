# FitMentor AI — Database Schema & Data Models

## Relational Schema (PostgreSQL)

### 1. `users` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Unique user identifier |
| `email` | `VARCHAR(255)` | `UNIQUE, NOT NULL` | User email address |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Encrypted password |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Display name |
| `fitness_level` | `VARCHAR(30)` | `CHECK in ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')` | Experience level |
| `primary_goal` | `VARCHAR(50)` | `DEFAULT 'HYPERTROPHY'` | Primary fitness objective |
| `target_calories` | `INTEGER` | `DEFAULT 2200` | Baseline daily calorie target |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Account creation date |

### 2. `workouts` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Workout template ID |
| `user_id` | `UUID` | `REFERENCES users(id) ON DELETE CASCADE` | Creator/Assignee ID |
| `title` | `VARCHAR(100)` | `NOT NULL` | e.g. "Power Hypertrophy Routine" |
| `category` | `VARCHAR(50)` | `NOT NULL` | "Upper Body", "Legs", "Push", "Cardio" |
| `duration_est_min` | `INTEGER` | `NOT NULL` | Estimated duration in minutes |
| `difficulty` | `VARCHAR(20)` | `DEFAULT 'INTERMEDIATE'` | Intensity scale |

### 3. `workout_logs` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Session log ID |
| `user_id` | `UUID` | `REFERENCES users(id)` | User ID |
| `workout_id` | `UUID` | `REFERENCES workouts(id)` | Associated template |
| `started_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | Start timestamp |
| `completed_at` | `TIMESTAMP WITH TIME ZONE` | | Completion timestamp |
| `total_calories` | `INTEGER` | | Actual calories burned |
| `average_hr` | `INTEGER` | | Mean heart rate during session |
| `rpe_score` | `INTEGER` | `CHECK (rpe_score BETWEEN 1 AND 10)` | Perceived exertion |

### 4. `daily_biometrics` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Log entry ID |
| `user_id` | `UUID` | `REFERENCES users(id)` | User ID |
| `log_date` | `DATE` | `NOT NULL` | Calendar date |
| `readiness_score` | `INTEGER` | `CHECK (readiness_score BETWEEN 0 AND 100)` | Daily composite score |
| `recovery_score` | `INTEGER` | `CHECK (recovery_score BETWEEN 0 AND 100)` | Autonomic nervous system score |
| `sleep_duration_min`| `INTEGER` | | Total sleep in minutes |
| `sleep_score` | `INTEGER` | `CHECK (sleep_score BETWEEN 0 AND 100)` | Quality index |
| `resting_hr` | `INTEGER` | | Lowest resting heart rate (bpm) |
| `daily_steps` | `INTEGER` | `DEFAULT 0` | Total steps counted |
| `active_calories` | `INTEGER` | `DEFAULT 0` | Active energy expenditure (kcal) |

### 5. `ai_chat_sessions` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Chat message identifier |
| `user_id` | `UUID` | `REFERENCES users(id)` | User ID |
| `role` | `VARCHAR(20)` | `CHECK (role in ('USER', 'ASSISTANT', 'SYSTEM'))` | Speaker role |
| `message` | `TEXT` | `NOT NULL` | Message payload |
| `context_metadata` | `JSONB` | | Embedded biometrics/workout tags |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp |
