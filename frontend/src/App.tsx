import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/navigation/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/Landing';
import { LoginPage, RegisterPage } from './pages/Login';
import { OnboardingPage } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { WorkoutPage } from './pages/Workout';
import { NutritionPage } from './pages/Nutrition';
import { ProgressPage } from './pages/Progress';
import { AICoachPage } from './pages/AICoach';
import { WearablesPage } from './pages/Wearables';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { ChallengesPage } from './pages/Challenges';
import { AchievementsPage } from './pages/Achievements';
import { apiService } from './services/api';
import { ReadinessScore, HealthMetric, Workout } from './types/fitness';
import { ActiveWorkoutWorkspace } from './components/workout/ActiveWorkoutWorkspace';

const AuthenticatedAppContent: React.FC = () => {
  const { user } = useAuth();
  const [readiness, setReadiness] = useState<ReadinessScore | null>(null);
  const [metrics, setMetrics] = useState<HealthMetric | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWorkoutOpen, setIsWorkoutOpen] = useState(false);
  const [activeSessionWorkout, setActiveSessionWorkout] = useState<Workout | null>(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(0);

  useEffect(() => {
    async function loadWorkspaceData() {
      try {
        const [rData, mData, wData] = await Promise.all([
          apiService.getReadiness(),
          apiService.getMetrics(),
          apiService.getWorkouts()
        ]);
        setReadiness(rData);
        setMetrics(mData);
        setWorkouts(wData);
      } catch (err) {
        console.error('Workspace data fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspaceData();
  }, []);

  const handleStartWorkout = (workoutId?: string, exerciseIndex: number = 0) => {
    setSelectedExerciseIndex(exerciseIndex);
    if (workoutId) {
      const found = workouts.find((w) => w.id === workoutId);
      if (found) {
        setActiveSessionWorkout(found);
      } else {
        setActiveSessionWorkout({
          id: workoutId,
          title: 'Prescribed AI Workout Routine',
          category: 'Prescribed',
          durationEstMin: 45,
          difficulty: 'INTERMEDIATE',
          exercises: []
        });
      }
    } else {
      setActiveSessionWorkout(workouts[0]);
    }
    setIsWorkoutOpen(true);
  };

  if (loading || !user || !readiness || !metrics || workouts.length === 0) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-primary animate-ping" />
          Loading Workspace Telemetry...
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <AppShell>
              <Dashboard
                user={user}
                readiness={readiness}
                metrics={metrics}
                workout={workouts[0]}
                onStartWorkout={handleStartWorkout}
              />
            </AppShell>
          }
        />
        <Route
          path="/workouts"
          element={
            <AppShell>
              <WorkoutPage />
            </AppShell>
          }
        />
        <Route
          path="/exercise-studio"
          element={
            <AppShell>
              <WorkoutPage initialTab="studio" />
            </AppShell>
          }
        />
      <Route
        path="/nutrition"
        element={
          <AppShell>
            <NutritionPage />
          </AppShell>
        }
      />
      <Route
        path="/progress"
        element={
          <AppShell>
            <ProgressPage />
          </AppShell>
        }
      />
      <Route
        path="/ai-coach"
        element={
          <AppShell>
            <AICoachPage />
          </AppShell>
        }
      />
      <Route
        path="/challenges"
        element={
          <AppShell>
            <ChallengesPage />
          </AppShell>
        }
      />
      <Route
        path="/achievements"
        element={
          <AppShell>
            <AchievementsPage />
          </AppShell>
        }
      />
      <Route
        path="/posture-analysis"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route
        path="/wearables"
        element={
          <AppShell>
            <WearablesPage />
          </AppShell>
        }
      />
      <Route
        path="/profile"
        element={
          <AppShell>
            <ProfilePage user={user} />
          </AppShell>
        }
      />
      <Route
        path="/settings"
        element={
          <AppShell>
            <SettingsPage />
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>

    {activeSessionWorkout && (
      <ActiveWorkoutWorkspace
        workout={activeSessionWorkout}
        isOpen={isWorkoutOpen}
        onClose={() => setIsWorkoutOpen(false)}
        initialExerciseIndex={selectedExerciseIndex}
      />
    )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Protected Workspace Pages */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AuthenticatedAppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
