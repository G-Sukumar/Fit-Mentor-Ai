# ⚡ FitMentor AI Backend Services

Production REST API Foundation built with **Node.js**, **Express.js**, and **TypeScript**.

## Architecture Overview

```
src/
├── config/           # Environment configuration loader
├── controllers/      # Request handlers & HTTP responses
├── middleware/       # Express error handling & auth middleware stubs
├── models/           # Data access objects & schemas
├── routes/           # RESTful API route declarations
├── services/         # Business logic & telemetry aggregators
├── types/            # TypeScript domain interfaces
├── utils/            # Logger & helper utilities
└── server.ts         # Main Express application entry point
```

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Health check endpoint: `GET http://localhost:5000/api/health`
