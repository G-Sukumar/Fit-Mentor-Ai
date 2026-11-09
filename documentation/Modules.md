# FitMentor AI — System Architecture & Modules

```mermaid
graph TD
    Client[Web Frontend / Mobile PWA] --> API[API Gateway / Router]
    
    subgraph Frontend Components
        UI[Stitch UI Design System]
        WebGL[Atmospheric WebGL Shader Engine]
        AIChat[AI Coach Chat Drawer]
        Tracker[Interactive Workout Tracker]
        Nutri[Macro & Diet Engine]
    end

    subgraph Backend Core Services
        Auth[Authentication & User Profile]
        WorkoutEngine[Workout & Periodization Service]
        AIService[AI Coach Agent & Prompt Orchestrator]
        VisionService[Pose Estimation & Kinematics]
        BiometricsService[Wearable Telemetry & Health Score]
    end

    subgraph Database Layer
        Postgres[(Relational DB: Users, Workouts, Logs)]
        VectorDB[(Vector Embeddings: Exercise Library & Q&A)]
        Redis[(Session Cache & Live Metrics)]
    end

    API --> Auth
    API --> WorkoutEngine
    API --> AIService
    API --> VisionService
    API --> BiometricsService

    WorkoutEngine --> Postgres
    AIService --> VectorDB
    BiometricsService --> Redis
```

## Module Breakdown

1. **Authentication & Profile Module**: Manages JWT user tokens, profile preferences, physical stats (height, weight, age, body fat %), and experience level.
2. **Workout Programming Module**: Generates progressive overload schedules, exercise substitutions, and stores historical volume load.
3. **AI Coach Intelligence Module**: Powered by Gemini / LLM with specialized system prompts, grounding with sports science literature, and context injection of recent workouts and recovery state.
4. **Computer Vision & Kinematics Module**: Analyzes live video stream landmarks (shoulders, elbows, wrists, hips, knees, ankles) to evaluate form symmetry and range of motion.
5. **Biometrics & Wearables Module**: Aggregates heart rate, steps, active energy burned, and sleep stages to calculate the composite Daily Readiness Score.
6. **Nutrition Engine Module**: Computes Total Daily Energy Expenditure (TDEE) and dynamically recalibrates daily macro goals based on actual energy expenditure.
