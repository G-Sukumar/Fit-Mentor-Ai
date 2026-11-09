# 🗄️ FitMentor AI Database Architecture & Migrations

PostgreSQL Relational Schema & Migration Pipeline for FitMentor AI.

## Directory Structure

```
database/
├── migrations/
│   └── 001_initial_schema.sql   # Normalized PostgreSQL DDL schema definition
├── seeds/
│   └── 001_initial_seed.sql     # Initial seed data for exercises and biometrics
└── README.md                    # Database execution documentation
```

## Running Migrations

To apply schema migrations to a PostgreSQL database instance:

```bash
# Apply initial schema DDL
psql -h localhost -U fitmentor_admin -d fitmentor_db -f database/migrations/001_initial_schema.sql

# Insert initial seed data
psql -h localhost -U fitmentor_admin -d fitmentor_db -f database/seeds/001_initial_seed.sql
```
