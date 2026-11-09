import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { getProfile, updateProfile, completeOnboarding } from '../controllers/profile.controller';
import { getExercises } from '../controllers/exercises.controller';
import { getProgression, syncProgression } from '../controllers/progression.controller';
import { 
  getWorkouts, 
  getWorkoutById,
  startWorkoutSession,
  logWorkoutSet,
  completeWorkoutSession,
  getWorkoutHistory,
  getProgress, 
  getMetrics, 
  getReadiness, 
  getRecommendations, 
  getWearables, 
  handleAIChat 
} from '../controllers/workouts.controller';
import { getPrescribedWorkout, evaluateAutoregulation } from '../controllers/adaptive.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// =============================================================================
// Public Endpoints
// =============================================================================
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'FitMentor AI API', timestamp: new Date().toISOString() });
});

router.post('/auth/register', register);
router.post('/auth/login', login);

// =============================================================================
// Protected Endpoints (Requires valid JWT Bearer Token)
// =============================================================================
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.patch('/profile', authenticateToken, updateProfile);
router.post('/profile/onboarding', authenticateToken, completeOnboarding);

// User RPG Progression & Solo Leveling System
router.get('/progression', authenticateToken, getProgression);
router.put('/progression', authenticateToken, syncProgression);
router.post('/progression/sync', authenticateToken, syncProgression);


// Exercise Library
router.get('/exercises', authenticateToken, getExercises);

// Workout Management & Session Endpoints
router.get('/workouts', authenticateToken, getWorkouts);
router.get('/workouts/history', authenticateToken, getWorkoutHistory);
router.get('/workouts/:id', authenticateToken, getWorkoutById);
router.get('/workouts/:id/prescribed', authenticateToken, getPrescribedWorkout);
router.post('/workouts/:id/start', authenticateToken, startWorkoutSession);
router.post('/workouts/session/:logId/log-set', authenticateToken, logWorkoutSet);
router.post('/workouts/session/:logId/autoregulate', authenticateToken, evaluateAutoregulation);
router.post('/workouts/session/:logId/auto-regulate', authenticateToken, evaluateAutoregulation);
router.post('/workouts/session/:logId/complete', authenticateToken, completeWorkoutSession);

// Telemetry & Metrics
router.get('/progress', authenticateToken, getProgress);
router.get('/metrics', authenticateToken, getMetrics);
router.get('/readiness', authenticateToken, getReadiness);
router.get('/recommendations', authenticateToken, getRecommendations);
router.get('/recommendations/workouts', authenticateToken, getRecommendations);
router.get('/wearables', authenticateToken, getWearables);

router.post('/ai/chat', authenticateToken, handleAIChat);

export default router;
