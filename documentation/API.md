# FitMentor AI — REST & Real-Time API Reference

**Base URL**: `http://localhost:5000/api`

---

## 1. Authentication & Security
- `POST /api/auth/register` — Register a new user account with bcrypt password hashing.
  * **Payload**:
    ```json
    { "name": "Sukumar", "email": "sukumar@fitmentor.ai", "password": "Password123!" }
    ```
  * **Response (201 Created)**:
    ```json
    {
      "success": true,
      "message": "Registration successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { "id": "uuid-v4", "name": "Sukumar", "email": "sukumar@fitmentor.ai" }
    }
    ```
- `POST /api/auth/login` — Authenticate credentials and issue JWT bearer token.
  * **Payload**:
    ```json
    { "email": "sukumar@fitmentor.ai", "password": "Password123!" }
    ```
  * **Response (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { "id": "uuid-v4", "name": "Sukumar", "email": "sukumar@fitmentor.ai" }
    }
    ```

---

## 2. Protected User Profile
*Requires Header*: `Authorization: Bearer <jwt_token>`

- `GET /api/profile` — Fetch current user's profile and body statistics.
- `PUT /api/profile` — Update body statistics (height, weight, body fat %, fitness level).
  * **Payload**:
    ```json
    { "heightCm": 178, "weightKg": 78, "bodyFatPercentage": 14.5, "primaryGoal": "HYPERTROPHY" }
    ```

---

## 3. Telemetry & Workouts (Protected)
*Requires Header*: `Authorization: Bearer <jwt_token>`

- `GET /api/readiness` — Composite readiness score (0-100) & recovery briefing.
- `GET /api/metrics` — Daily steps, active energy, sleep duration, resting HR.
- `GET /api/workouts` — Active and recommended training programs.
- `GET /api/progress` — Weekly volume load progression statistics.
- `GET /api/wearables` — Smartwatch sync telemetry status.
- `POST /api/ai/chat` — Conversational AI Coach prompt interaction.
