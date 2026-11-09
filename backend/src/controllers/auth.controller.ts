import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { config } from '../config';
import { logger } from '../utils/logger';
import { inMemoryProgression, createDefaultProgression } from './progression.controller';

// In-memory fallback user store when PostgreSQL database is offline
const inMemoryUsers: Map<string, { id: string; email: string; password_hash: string; full_name: string; fitness_level: string; primary_goal: string; target_calories: number }> = new Map();

// Seed initial in-memory default user matching database seed
(async () => {
  const seedHash = await bcrypt.hash('Password123!', 10);
  inMemoryUsers.set('sukumar@fitmentor.ai', {
    id: 'u_sukumar_01',
    email: 'sukumar@fitmentor.ai',
    password_hash: seedHash,
    full_name: 'Sukumar',
    fitness_level: 'ADVANCED',
    primary_goal: 'HYPERTROPHY',
    target_calories: 2400
  });
})();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req: Request, res: Response) => {
  try {
    const { name, fullName, email, password } = req.body;
    const userName = name || fullName;

    // 1. Input Validation
    if (!userName || !userName.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check duplicate email in PostgreSQL or In-Memory fallback
    let existingUser: any = null;
    try {
      const dbResult = await query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
      if (dbResult && dbResult.rows.length > 0) {
        existingUser = dbResult.rows[0];
      }
    } catch {
      existingUser = inMemoryUsers.get(normalizedEmail);
    }

    if (existingUser || inMemoryUsers.has(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    // 3. Hash Password using bcryptjs
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Save User to Database or Fallback Store
    let newUser: { id: string; name: string; email: string };

    try {
      const dbRes = await query(
        `INSERT INTO users (email, password_hash, full_name, fitness_level, primary_goal, target_calories)
         VALUES ($1, $2, $3, 'INTERMEDIATE', 'HYPERTROPHY', 2400)
         RETURNING id, full_name as name, email`,
        [normalizedEmail, passwordHash, userName.trim()]
      );

      const userId = dbRes.rows[0].id;
      await query(`INSERT INTO user_profiles (user_id, age, height_cm, weight_kg, body_fat_percentage, wearable_device, streak_days)
                   VALUES ($1, 26, 178, 78, 14.5, 'Galaxy Watch 6', 0)
                   ON CONFLICT (user_id) DO NOTHING`, [userId]);

      await query(
        `INSERT INTO user_progression (user_id, current_level, current_xp, total_earned_xp, hunter_rank, equipped_avatar_id, equipped_aura_id, equipped_title_id, claimed_level_rewards)
         VALUES ($1, 1, 0, 0, 'E-Rank', 'kamish_10', 'aura_initiate', 'title_kamish', '{1}')
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );

      newUser = { id: userId, name: dbRes.rows[0].name, email: dbRes.rows[0].email };
    } catch (err: any) {
      logger.warn('PostgreSQL insert unavailable, saving to in-memory fallback store:', err.message);
      const mockId = `u_${Date.now()}`;
      inMemoryUsers.set(normalizedEmail, {
        id: mockId,
        email: normalizedEmail,
        password_hash: passwordHash,
        full_name: userName.trim(),
        fitness_level: 'INTERMEDIATE',
        primary_goal: 'HYPERTROPHY',
        target_calories: 2400
      });
      inMemoryProgression.set(mockId, createDefaultProgression(mockId));
      newUser = { id: mockId, name: userName.trim(), email: normalizedEmail };
    }

    // 5. Generate JWT Token
    const secret = process.env.JWT_SECRET || config.jwt.secret;
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, fullName: newUser.name },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: newUser
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find User by Email
    let userRecord: any = null;
    try {
      const dbResult = await query('SELECT id, email, password_hash, full_name, fitness_level, primary_goal FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
      if (dbResult && dbResult.rows.length > 0) {
        userRecord = dbResult.rows[0];
      }
    } catch {
      userRecord = inMemoryUsers.get(normalizedEmail);
    }

    if (!userRecord && inMemoryUsers.has(normalizedEmail)) {
      userRecord = inMemoryUsers.get(normalizedEmail);
    }

    if (!userRecord) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 2. Compare Password Hash
    const isPasswordValid = await bcrypt.compare(password, userRecord.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // 3. Sign JWT Token
    const secret = process.env.JWT_SECRET || config.jwt.secret;
    const token = jwt.sign(
      {
        id: userRecord.id,
        email: userRecord.email,
        fullName: userRecord.full_name || userRecord.name
      },
      secret,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: userRecord.id,
        name: userRecord.full_name || userRecord.name || 'Athlete',
        email: userRecord.email,
        fitnessLevel: userRecord.fitness_level || 'INTERMEDIATE',
        primaryGoal: userRecord.primary_goal || 'HYPERTROPHY'
      }
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};
