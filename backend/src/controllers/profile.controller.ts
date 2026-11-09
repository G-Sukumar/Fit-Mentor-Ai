import { Request, Response } from 'express';
import { query } from '../config/db';
import { mockUserProfile } from '../services/mockService';
import { logger } from '../utils/logger';

const profileStore: Map<string, any> = new Map();

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
      const result = await query(
        `SELECT u.id, u.email, u.full_name as "fullName", u.fitness_level as "fitnessLevel", 
                u.primary_goal as "primaryGoal", u.target_calories as "targetCalories", u.created_at as "createdAt",
                p.age, p.height_cm as "heightCm", p.weight_kg as "weightKg", p.body_fat_percentage as "bodyFatPercentage",
                p.activity_level as "activityLevel", p.workout_location as "workoutLocation",
                p.available_equipment as "availableEquipment", p.preferred_duration_min as "preferredDurationMin",
                p.training_days_per_week as "trainingDaysPerWeek", p.wearable_device as "wearableDevice", 
                p.streak_days as "streakDays", COALESCE(p.onboarding_completed, FALSE) as "onboardingCompleted"
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE u.id = $1`,
        [userId]
      );

      if (result && result.rows.length > 0) {
        return res.status(200).json(result.rows[0]);
      }
    } catch (dbErr: any) {
      logger.warn('PostgreSQL query profile fallback:', dbErr.message);
    }

    const saved = profileStore.get(userId);
    if (saved) {
      return res.status(200).json(saved);
    }

    return res.status(200).json({
      ...mockUserProfile,
      id: userId,
      email: req.user?.email || mockUserProfile.email,
      fullName: req.user?.fullName || mockUserProfile.fullName,
      onboardingCompleted: false
    });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving user profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      fullName, age, heightCm, weightKg, bodyFatPercentage,
      activityLevel, workoutLocation, availableEquipment,
      preferredDurationMin, trainingDaysPerWeek,
      fitnessLevel, primaryGoal, targetCalories, onboardingCompleted
    } = req.body;

    try {
      if (fullName || fitnessLevel || primaryGoal || targetCalories) {
        await query(
          `UPDATE users 
           SET full_name = COALESCE($1, full_name),
               fitness_level = COALESCE($2, fitness_level),
               primary_goal = COALESCE($3, primary_goal),
               target_calories = COALESCE($4, target_calories)
           WHERE id = $5`,
          [fullName, fitnessLevel, primaryGoal, targetCalories, userId]
        );
      }

      await query(
        `INSERT INTO user_profiles (user_id, age, height_cm, weight_kg, body_fat_percentage, 
                                    activity_level, workout_location, available_equipment, 
                                    preferred_duration_min, training_days_per_week, onboarding_completed, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, FALSE), CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE 
         SET age = COALESCE($2, user_profiles.age),
             height_cm = COALESCE($3, user_profiles.height_cm),
             weight_kg = COALESCE($4, user_profiles.weight_kg),
             body_fat_percentage = COALESCE($5, user_profiles.body_fat_percentage),
             activity_level = COALESCE($6, user_profiles.activity_level),
             workout_location = COALESCE($7, user_profiles.workout_location),
             available_equipment = COALESCE($8, user_profiles.available_equipment),
             preferred_duration_min = COALESCE($9, user_profiles.preferred_duration_min),
             training_days_per_week = COALESCE($10, user_profiles.training_days_per_week),
             onboarding_completed = COALESCE($11, user_profiles.onboarding_completed),
             updated_at = CURRENT_TIMESTAMP`,
        [
          userId, age, heightCm, weightKg, bodyFatPercentage,
          activityLevel, workoutLocation, availableEquipment,
          preferredDurationMin, trainingDaysPerWeek, onboardingCompleted
        ]
      );
    } catch (dbErr: any) {
      logger.warn('PostgreSQL update profile fallback:', dbErr.message);
    }

    const current = profileStore.get(userId) || {
      ...mockUserProfile,
      id: userId,
      email: req.user?.email,
      fullName: req.user?.fullName,
      onboardingCompleted: false
    };

    const updatedProfile = {
      ...current,
      fullName: fullName || current.fullName,
      age: age !== undefined ? Number(age) : current.age,
      heightCm: heightCm !== undefined ? Number(heightCm) : current.heightCm,
      weightKg: weightKg !== undefined ? Number(weightKg) : current.weightKg,
      bodyFatPercentage: bodyFatPercentage !== undefined ? Number(bodyFatPercentage) : current.bodyFatPercentage,
      activityLevel: activityLevel || current.activityLevel || 'MODERATELY_ACTIVE',
      workoutLocation: workoutLocation || current.workoutLocation || 'GYM',
      availableEquipment: availableEquipment || current.availableEquipment || 'FULL_GYM',
      preferredDurationMin: preferredDurationMin !== undefined ? Number(preferredDurationMin) : current.preferredDurationMin,
      trainingDaysPerWeek: trainingDaysPerWeek !== undefined ? Number(trainingDaysPerWeek) : current.trainingDaysPerWeek,
      fitnessLevel: fitnessLevel || current.fitnessLevel || 'INTERMEDIATE',
      primaryGoal: primaryGoal || current.primaryGoal || 'HYPERTROPHY',
      targetCalories: targetCalories || current.targetCalories || 2400,
      onboardingCompleted: onboardingCompleted !== undefined ? Boolean(onboardingCompleted) : current.onboardingCompleted
    };

    profileStore.set(userId, updatedProfile);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Error updating user profile' });
  }
};

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const {
      age, heightCm, weightKg, fitnessLevel, activityLevel,
      primaryGoal, workoutLocation, availableEquipment,
      preferredDurationMin, trainingDaysPerWeek
    } = req.body;

    // Input Validation
    const ageNum = Number(age);
    const heightNum = Number(heightCm);
    const weightNum = Number(weightKg);

    if (!age || isNaN(ageNum) || ageNum < 14 || ageNum > 100) {
      return res.status(400).json({ success: false, message: 'Age must be between 14 and 100.' });
    }
    if (!heightCm || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      return res.status(400).json({ success: false, message: 'Height must be between 100 cm and 250 cm.' });
    }
    if (!weightKg || isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      return res.status(400).json({ success: false, message: 'Weight must be between 30 kg and 300 kg.' });
    }
    if (!fitnessLevel) {
      return res.status(400).json({ success: false, message: 'Fitness level selection is required.' });
    }
    if (!activityLevel) {
      return res.status(400).json({ success: false, message: 'Activity level selection is required.' });
    }
    if (!primaryGoal) {
      return res.status(400).json({ success: false, message: 'Primary fitness goal is required.' });
    }

    // Persist to PostgreSQL
    try {
      await query(
        `UPDATE users 
         SET fitness_level = $1, primary_goal = $2
         WHERE id = $3`,
        [fitnessLevel, primaryGoal, userId]
      );

      await query(
        `INSERT INTO user_profiles (user_id, age, height_cm, weight_kg, activity_level, 
                                    workout_location, available_equipment, preferred_duration_min, 
                                    training_days_per_week, onboarding_completed, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE 
         SET age = EXCLUDED.age,
             height_cm = EXCLUDED.height_cm,
             weight_kg = EXCLUDED.weight_kg,
             activity_level = EXCLUDED.activity_level,
             workout_location = EXCLUDED.workout_location,
             available_equipment = EXCLUDED.available_equipment,
             preferred_duration_min = EXCLUDED.preferred_duration_min,
             training_days_per_week = EXCLUDED.training_days_per_week,
             onboarding_completed = TRUE,
             updated_at = CURRENT_TIMESTAMP`,
        [
          userId, ageNum, heightNum, weightNum, activityLevel,
          workoutLocation || 'GYM', availableEquipment || 'FULL_GYM',
          preferredDurationMin ? Number(preferredDurationMin) : 60,
          trainingDaysPerWeek ? Number(trainingDaysPerWeek) : 4
        ]
      );
    } catch (dbErr: any) {
      logger.warn('PostgreSQL onboarding completion fallback:', dbErr.message);
    }

    const completedProfile = {
      id: userId,
      email: req.user?.email,
      fullName: req.user?.fullName || 'Athlete',
      age: ageNum,
      heightCm: heightNum,
      weightKg: weightNum,
      fitnessLevel,
      activityLevel,
      primaryGoal,
      workoutLocation: workoutLocation || 'GYM',
      availableEquipment: availableEquipment || 'FULL_GYM',
      preferredDurationMin: preferredDurationMin ? Number(preferredDurationMin) : 60,
      trainingDaysPerWeek: trainingDaysPerWeek ? Number(trainingDaysPerWeek) : 4,
      onboardingCompleted: true,
      streakDays: 1,
      targetCalories: 2400
    };

    profileStore.set(userId, completedProfile);

    return res.status(200).json({
      success: true,
      message: 'Fitness onboarding completed successfully!',
      profile: completedProfile
    });
  } catch (error: any) {
    logger.error('Onboarding submission error:', error);
    return res.status(500).json({ success: false, message: 'Error completing fitness onboarding.' });
  }
};
