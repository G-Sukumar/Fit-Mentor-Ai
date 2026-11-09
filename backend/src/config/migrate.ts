import fs from 'fs';
import path from 'path';
import { pool } from './db';
import { logger } from '../utils/logger';

function resolveDatabaseDir(): string | null {
  const candidates = [
    process.env.DATABASE_DIR,
    path.resolve(process.cwd(), 'database'),
    path.resolve(process.cwd(), '../database'),
    path.resolve(__dirname, '../../../database'),
    path.resolve(__dirname, '../../database'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'migrations'))) {
      return candidate;
    }
  }
  return null;
}

export const runDatabaseMigrations = async (): Promise<boolean> => {
  try {
    const dbDir = resolveDatabaseDir();
    if (!dbDir) {
      logger.warn('⚠️ Could not locate database migrations directory. Skipping auto-migration.');
      return false;
    }

    const migrationFiles = [
      'migrations/001_initial_schema.sql',
      'migrations/002_onboarding_profile_fields.sql',
      'migrations/003_workout_management.sql',
      'migrations/004_workout_recommendations.sql',
      'migrations/005_adaptive_training.sql',
      'migrations/006_user_progression.sql',
      'migrations/007_home_exercises_workouts.sql',
      'seeds/001_initial_seed.sql',
      'seeds/002_exercise_seed.sql',
      'seeds/003_workout_recommendation_seed.sql'
    ];

    for (const fileRel of migrationFiles) {
      const fullPath = path.join(dbDir, fileRel);
      if (fs.existsSync(fullPath)) {
        const sql = fs.readFileSync(fullPath, 'utf8');
        await pool.query(sql);
        logger.info(`✅ PostgreSQL migration/seed executed: ${fileRel}`);
      }
    }

    return true;
  } catch (err: any) {
    logger.warn(`⚠️ Database migration runner info: ${err.message}`);
    return false;
  }
};

