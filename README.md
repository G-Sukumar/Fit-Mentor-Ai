# ⚡ FitMentor AI — Next-Gen AI Fitness & Biomechanics Platform

> **Theme**: `Kinetic Horizon` (High-Fidelity Health-Tech Dark Mode)  
> **Connected to Google Stitch Project**: [`projects/16575783439607592046`](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/design/stitch.config.json)

[![Design System](https://img.shields.io/badge/Design_System-Kinetic_Horizon-8b5cf6?style=for-the-badge)](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/design/DESIGN.md)
[![Frontend](https://img.shields.io/badge/Frontend-React_18_%7C_Vite_%7C_Three.js-22d3ee?style=for-the-badge)](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js_%7C_Express_%7C_TypeScript-38bdf8?style=for-the-badge)](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/backend)
[![Database](https://img.shields.io/badge/Database-PostgreSQL_16-336791?style=for-the-badge)](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/database)

---

## 📖 Overview

**FitMentor AI** is an enterprise-grade, full-stack personal fitness and biomechanics platform. It combines personalized resistance and cardiovascular programming, real-time biometrics analytics (Readiness Score engine), interactive 3D exercise execution visualization (Three.js), sports-science AI coaching, dynamic nutrition tracking, and ML-driven workout recommendations.

---

## ✨ Key Features

- 🧠 **Dynamic Readiness Engine**: Multi-metric physiological readiness score calculation incorporating sleep quality, HRV, resting heart rate, muscle soreness, and stress levels.
- 🏋️ **Interactive 3D Biomechanics Viewer**: Real-time 3D skeletal posture and biomechanical execution guide powered by Three.js with camera presets (Front, Side, Isometric) and playback speed controls.
- 💬 **AI Sports Science Coach**: Conversational fitness assistant equipped with exercise science domain knowledge, prompt presets, and contextual training advice.
- 📊 **Analytics & Telemetry Dashboard**: Visual weekly volume distribution, muscle group activation breakdowns, strength progression trends, and calorie burn metrics.
- 🥗 **Macro & Nutrition Logger**: Dynamic daily caloric targets, water intake tracker, and macro distribution breakdown.
- 🗄️ **Full-Stack REST Architecture**: Express + TypeScript backend REST API with PostgreSQL relational database migrations and JWT authentication.

---

## 📁 Repository Structure

```
FitMentorAI/
├── assets/
│   ├── images/               # High-res UI assets & photography
│   └── shaders/              # WebGL atmospheric fragment shaders
├── backend/                  # Node.js + Express + TypeScript REST API Server
│   ├── src/
│   │   ├── controllers/      # API Controllers
│   │   ├── routes/           # REST Route Definitions
│   │   ├── services/         # Business & Mock Services
│   │   └── server.ts         # Express App Entry Point
│   └── package.json
├── database/                 # PostgreSQL Relational Schemas & Migrations
│   └── migrations/           # SQL migration scripts (001–004)
├── design/                   # Design tokens & Google Stitch integration
│   ├── DESIGN.md             # Kinetic Horizon Design Tokens & Specification
│   └── stitch.config.json    # Google Stitch Project Configuration
├── documentation/            # Comprehensive Architecture & Technical Specs
│   ├── AIML.md               # AI/ML Architecture & Readiness Model
│   ├── API.md                # REST API Endpoints Specification
│   ├── Database.md           # PostgreSQL Schemas & Data Dictionary
│   ├── Features.md           # Functional Specs & Module Breakdown
│   ├── Modules.md            # System Architecture & Sequence Flow
│   ├── Objectives.md         # Key Objectives & Roadmap
│   ├── ProblemStatement.md   # Product Vision & Domain Challenges
│   └── ReadinessModel.md     # Mathematical Readiness Algorithm Spec
├── frontend/                 # React 18 + Vite + Tailwind CSS App
│   ├── src/
│   │   ├── components/       # UI Components & 3D Viewer Canvas
│   │   ├── hooks/            # Custom Hooks (useExercise3DScene, etc.)
│   │   ├── pages/            # Page Views (Dashboard, Workout, Analytics, etc.)
│   │   └── services/         # Frontend API Client
│   └── package.json
├── ml/                       # Machine Learning Models & Pipelines
│   └── main.py               # ML Recommendation Engine Core
└── README.md                 # Master Repository Documentation
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Three.js, Lucide React |
| **Backend** | Node.js, Express, TypeScript, JWT, bcryptjs, `pg` (PostgreSQL client) |
| **Database** | PostgreSQL 16 (Relational Schema & Vector/JSON support) |
| **3D Rendering** | Three.js (WebGL 2 procedural skeletal animation) |
| **Design System** | Kinetic Horizon (Dark Mode, Cyan/Purple Neon Accents, Glassmorphism) |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher
- **PostgreSQL**: v14+ (optional, server auto-runs in hybrid mode if DB is offline)

### 2. Quick Unified Start (Recommended)
You can run both backend and frontend concurrently from the root directory:
```bash
# 1. Install all dependencies
npm run install:all

# 2. Run backend and frontend concurrently
npm run dev

# 3. Build entire full-stack for production
npm run build

# 4. Start production server (serves API and compiled React SPA on port 5000)
npm start

# 5. Run test suites
npm test
```
- Frontend UI: `http://localhost:5173` (dev) or `http://localhost:5000` (production)
- REST API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`

### 3. Production Cloud Deployment
See [DEPLOYMENT.md](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/DEPLOYMENT.md) for step-by-step guides for:
- 🌟 **Render** (1-Click Blueprint with `render.yaml`)
- 🐳 **Docker & Docker Compose** (`docker-compose up -d --build`)
- 🚂 **Railway**
- ⚡ **Vercel + Supabase / Neon** (Split Cloud Deployment)


---

## 📚 Technical Documentation

For detailed technical specs, refer to the [`documentation/`](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/documentation) directory:
- 📖 [Database Schema Specification](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/documentation/Database.md)
- 🧮 [Readiness Score Mathematical Model](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/documentation/ReadinessModel.md)
- 🔌 [API Endpoints Reference](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/documentation/API.md)
- 🤖 [AI & ML System Architecture](file:///c:/Users/sukum/OneDrive/Documents/FitMentorAI/documentation/AIML.md)
