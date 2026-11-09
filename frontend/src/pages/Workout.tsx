import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dumbbell, Search, Filter, History, Sparkles, Plus, Play, CheckCircle2, Box } from 'lucide-react';
import { Workout, Exercise, WorkoutSessionLog } from '../types/fitness';
import { WorkoutCard } from '../components/workout/WorkoutCard';
import { ExerciseCard } from '../components/workout/ExerciseCard';
import { WorkoutHistoryCard } from '../components/workout/WorkoutHistoryCard';
import { ActiveWorkoutWorkspace } from '../components/workout/ActiveWorkoutWorkspace';
import { RepDB3DStudio } from '../components/workout/RepDB3DStudio';
import { apiService } from '../services/api';

interface WorkoutPageProps {
  initialTab?: 'plans' | 'library' | 'history' | 'studio';
}

export const WorkoutPage: React.FC<WorkoutPageProps> = ({ initialTab = 'plans' }) => {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') as 'plans' | 'library' | 'history' | 'studio' | null;
  const initialEx = searchParams.get('exercise') || undefined;
  const [activeTab, setActiveTab] = useState<'plans' | 'library' | 'history' | 'studio'>(
    urlTab || initialTab
  );
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<WorkoutSessionLog[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');

  // Active modal state
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  useEffect(() => {
    async function loadWorkoutData() {
      try {
        const plans = await apiService.getWorkouts();
        setWorkouts(plans);
      } catch {
        // Fallback
      }

      try {
        const exList = await apiService.getExercises();
        setExercises(exList);
      } catch {
        // Fallback
      }

      try {
        const hist = await apiService.getWorkoutHistory();
        setHistory(hist);
      } catch {
        // Fallback
      }
    }

    loadWorkoutData();
  }, []);

  const handleStartWorkout = (workoutId: string, exerciseIndex: number = 0) => {
    const found = workouts.find((w) => w.id === workoutId) || workouts[0];
    if (found) {
      setSelectedWorkout(found);
      setSelectedExerciseIndex(exerciseIndex);
      setIsModalOpen(true);
    }
  };

  const handleSessionCompleted = async () => {
    try {
      const hist = await apiService.getWorkoutHistory();
      setHistory(hist);
    } catch {
      // Fallback
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    if (selectedMuscle === 'ALL') return true;
    return ex.category.toUpperCase() === selectedMuscle.toUpperCase();
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header & Sub-navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-xs font-mono text-cyan shadow-[0_0_12px_rgba(34,211,238,0.15)] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HUNTER COMBAT TRAINING ENGINE</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-text-primary tracking-tight">
            Workout Management & Biomechanical 3D Studio
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Execute periodized routines, master 3D joint kinematics, and log progressive overload telemetry.
          </p>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-navy-elevated p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'plans'
                ? 'bg-gradient-to-r from-electric-blue to-cyan text-background shadow-[0_0_12px_rgba(34,211,238,0.3)] font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Workout Plans
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'library'
                ? 'bg-gradient-to-r from-electric-blue to-cyan text-background shadow-[0_0_12px_rgba(34,211,238,0.3)] font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Exercise Library ({exercises.length})
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-cyan to-secondary text-background shadow-[0_0_16px_rgba(34,211,238,0.4)] font-bold'
                : 'text-cyan hover:text-white bg-cyan/10 border border-cyan/30'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Studio (RepDB)</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-electric-blue to-cyan text-background shadow-[0_0_12px_rgba(34,211,238,0.3)] font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            History Log ({history.length})
          </button>
        </div>
      </div>

      {/* ===================================================================
           TAB 0: 3D STUDIO (REPDB)
           =================================================================== */}
      {activeTab === 'studio' && (
        <RepDB3DStudio
          initialExerciseId={initialEx}
          onSelectForWorkout={(exerciseId) => {
            const found = workouts.find((w) =>
              w.exercises && w.exercises.some((e) => e.id === exerciseId)
            ) || workouts[0];
            if (found) {
              setSelectedWorkout(found);
              setIsModalOpen(true);
            }
          }}
        />
      )}

      {/* ===================================================================
           TAB 1: WORKOUT PLANS
           =================================================================== */}
      {activeTab === 'plans' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workouts.map((w) => (
              <WorkoutCard key={w.id} workout={w} onStart={handleStartWorkout} />
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================
           TAB 2: EXERCISE LIBRARY BROWSER
           =================================================================== */}
      {activeTab === 'library' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {['ALL', 'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'LEGS', 'CORE', 'FULL BODY'].map((muscle) => (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedMuscle === muscle
                    ? 'bg-secondary text-background font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : 'bg-surface-container border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {muscle}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================
           TAB 3: WORKOUT HISTORY LOGS
           =================================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-fade-in">
          {history.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {history.map((session) => (
                <WorkoutHistoryCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center rounded-2xl border border-border space-y-4">
              <History className="w-12 h-12 text-text-muted mx-auto" />
              <h3 className="text-lg font-display font-bold text-text-primary">No Completed Workout History Yet</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Start an active workout session from the Workout Plans tab to log set-by-set reps and weight telemetry.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Active 3D Workout Session Workspace */}
      {selectedWorkout && (
        <ActiveWorkoutWorkspace
          workout={selectedWorkout}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSessionCompleted={handleSessionCompleted}
          initialExerciseIndex={selectedExerciseIndex}
        />
      )}
    </div>
  );
};
