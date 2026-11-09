import { Pool } from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const useSSL = process.env.DB_SSL === 'true' || (isProduction && connectionString && !connectionString.includes('localhost'));

export const pool = new Pool(
  connectionString
    ? { 
        connectionString,
        ssl: useSSL ? { rejectUnauthorized: false } : undefined
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'fitmentor_db',
        user: process.env.DB_USER || 'fitmentor_admin',
        password: process.env.DB_PASSWORD || '',
        ssl: useSSL ? { rejectUnauthorized: false } : undefined
      }
);

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.info(`SQL Query executed in ${duration}ms:`, { text: text.substring(0, 80), rows: res.rowCount });
    return res;
  } catch (error: any) {
    logger.error('Database query error:', { text, error: error.message });
    throw error;
  }
};

export const verifyDbConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    logger.info('✅ PostgreSQL database connection established successfully.');
    client.release();
    return true;
  } catch (err: any) {
    logger.warn(`⚠️ PostgreSQL connection warning: ${err.message}. Backend will run in hybrid storage mode.`);
    return false;
  }
};
