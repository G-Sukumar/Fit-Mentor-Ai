import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'fitmentor_db',
    user: process.env.DB_USER || 'fitmentor_admin',
    password: process.env.DB_PASSWORD || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  }
};
