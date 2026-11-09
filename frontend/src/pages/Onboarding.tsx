import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Dumbbell, 
  Activity, 
  Target, 
  Sliders, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { FitnessLevel, ActivityLevel, PrimaryGoal, WorkoutLocation, EquipmentChoice } from '../types/fitness';
import logoImg from '../assets/images/logo.png';

export const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitOnboarding } = useAuth();
  const navigate = useNavigate();

  // State across all 6 steps
  const [formData, setFormData] = useState({
    age: 26,
    heightCm: 178,
    weightKg: 78,
    fitnessLevel: 'INTERMEDIATE' as FitnessLevel,
    activityLevel: 'MODERATELY_ACTIVE' as ActivityLevel,
    primaryGoal: 'HYPERTROPHY' as PrimaryGoal,
    workoutLocation: 'GYM' as WorkoutLocation,
    availableEquipment: 'FULL_GYM' as EquipmentChoice,
    preferredDurationMin: 60,
    trainingDaysPerWeek: 4
  });

  const totalSteps = 6;

  const handleNext = () => {
    setError(null);
    // Step validation
    if (currentStep === 1) {
      if (!formData.age || formData.age < 14 || formData.age > 100) {
        setError('Age must be between 14 and 100.');
        return;
      }
      if (!formData.heightCm || formData.heightCm < 100 || formData.heightCm > 250) {
        setError('Height must be between 100 cm and 250 cm.');
        return;
      }
      if (!formData.weightKg || formData.weightKg < 30 || formData.weightKg > 300) {
        setError('Weight must be between 30 kg and 300 kg.');
        return;
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    const result = await submitOnboarding(formData);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Failed to complete onboarding. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 relative z-10 animate-fade-in py-12">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Brand & Progress Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <img src={logoImg} alt="FitMentor AI Logo" className="w-14 h-14 object-contain rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.35)] mb-1" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-mono text-primary shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fitness Onboarding • Step {currentStep} of {totalSteps}</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">
            Personalize Your FitMentor AI Program
          </h1>
          <p className="text-xs text-text-secondary">
            Configure your biometrics, activity level, and goals to generate target training metrics.
          </p>

          {/* Progress Bar Indicator */}
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-4 border border-border/40">
            <div
              className="bg-gradient-to-r from-primary via-cyan-400 to-secondary h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Validation Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Container Card */}
        <div className="glass-card-elevated rounded-2xl p-8 border border-border space-y-6 shadow-2xl">
          
          {/* ===================================================================
               STEP 1: BASIC PROFILE (Age, Height, Weight)
               =================================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-text-primary">Step 1 — Basic Profile</h3>
                  <p className="text-xs text-text-secondary">Your baseline physical parameters.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-mono text-text-secondary uppercase">Age (years)</label>
                  <input
                    type="number"
                    min={14}
                    max={100}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-surface-container border border-border/80 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-text-secondary uppercase">Height (cm)</label>
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-surface-container border border-border/80 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-text-secondary uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-surface-container border border-border/80 rounded-xl px-4 py-3 text-sm text-text-primary focus:border-primary outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
               STEP 2: FITNESS LEVEL
               =================================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/30">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-text-primary">Step 2 — Fitness Level</h3>
                  <p className="text-xs text-text-secondary">Select your current training experience level.</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { level: 'BEGINNER', title: 'Beginner Athlete', desc: '0–1 years of consistent resistance training. Learning proper exercise form and mechanics.' },
                  { level: 'INTERMEDIATE', title: 'Intermediate Lifter', desc: '1–3 years of structured training. Familiar with progressive overload and main compound movements.' },
                  { level: 'ADVANCED', title: 'Advanced Athlete', desc: '3+ years of systematic periodization, RPE autoregulation, and high volume training.' },
                ].map((opt) => (
                  <div
                    key={opt.level}
                    onClick={() => setFormData({ ...formData, fitnessLevel: opt.level as FitnessLevel })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.fitnessLevel === opt.level
                        ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'bg-surface-container/50 border-border/60 hover:border-border text-text-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-text-primary text-sm">{opt.title}</h4>
                      {formData.fitnessLevel === opt.level && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
               STEP 3: ACTIVITY LEVEL
               =================================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/30">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-text-primary">Step 3 — Daily Activity Level</h3>
                  <p className="text-xs text-text-secondary">How much you move around during a normal day (outside of workouts).</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'SEDENTARY', title: 'Sedentary (Mostly Sitting)', desc: 'Desk job or sitting for most of the day (under 4,000 steps/day).' },
                  { key: 'LIGHTLY_ACTIVE', title: 'Lightly Active', desc: 'Light walking, standing, or doing chores (4,000–7,000 steps/day).' },
                  { key: 'MODERATELY_ACTIVE', title: 'Moderately Active', desc: 'On your feet often or walking regularly (7,000–11,000 steps/day).' },
                  { key: 'VERY_ACTIVE', title: 'Very Active', desc: 'Active job or moving around most of the day (11,000–15,000 steps/day).' },
                  { key: 'EXTREMELY_ACTIVE', title: 'Extremely Active', desc: 'Heavy physical work or hard training every day (over 15,000 steps/day).' },
                ].map((opt) => (
                  <div
                    key={opt.key}
                    onClick={() => setFormData({ ...formData, activityLevel: opt.key as ActivityLevel })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      formData.activityLevel === opt.key
                        ? 'bg-gold/10 border-gold shadow-[0_0_15px_rgba(212,175,106,0.2)]'
                        : 'bg-surface-container/50 border-border/60 hover:border-border text-text-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-text-primary text-sm">{opt.title}</h4>
                      {formData.activityLevel === opt.key && <CheckCircle2 className="w-5 h-5 text-gold" />}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
               STEP 4: FITNESS GOAL
               =================================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center border border-success/30">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-text-primary">Step 4 — Primary Fitness Goal</h3>
                  <p className="text-xs text-text-secondary">Select your main target outcome for program generation.</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { goal: 'HYPERTROPHY', title: 'Muscle Gain', desc: 'Build muscle size, get stronger, and improve body shape.' },
                  { goal: 'FAT_LOSS', title: 'Fat Loss & Lean Muscle', desc: 'Burn fat, tone up, and maintain lean muscle.' },
                  { goal: 'STRENGTH', title: 'Maximal Strength', desc: 'Lift heavier weights and build raw whole-body power.' },
                  { goal: 'ENDURANCE', title: 'Cardio & Stamina', desc: 'Boost endurance, breathing stamina, and heart health.' },
                  { goal: 'GENERAL_FITNESS', title: 'General Fitness & Health', desc: 'Stay active, boost daily energy, and feel great.' },
                ].map((opt) => (
                  <div
                    key={opt.goal}
                    onClick={() => setFormData({ ...formData, primaryGoal: opt.goal as PrimaryGoal })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.primaryGoal === opt.goal
                        ? 'bg-success/10 border-success shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                        : 'bg-surface-container/50 border-border/60 hover:border-border text-text-secondary'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-text-primary text-sm">{opt.title}</h4>
                      {formData.primaryGoal === opt.goal && <CheckCircle2 className="w-5 h-5 text-success" />}
                    </div>
                    <p className="text-xs text-text-muted mt-1">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
               STEP 5: WORKOUT PREFERENCES
               =================================================================== */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/30">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-text-primary">Step 5 — Workout Preferences</h3>
                  <p className="text-xs text-text-secondary">Location, equipment, duration, and frequency preferences.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-mono text-text-secondary uppercase">Workout Location</label>
                  <select
                    value={formData.workoutLocation}
                    onChange={(e) => setFormData({ ...formData, workoutLocation: e.target.value as WorkoutLocation })}
                    className="w-full mt-1.5 bg-surface-container border border-border/80 rounded-xl px-4 py-3 text-sm text-text-primary outline-none"
                  >
                    <option value="GYM">Commercial Gym</option>
                    <option value="HOME">Home Workout</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-text-secondary uppercase">Available Equipment</label>
                  <select
                    value={formData.availableEquipment}
                    onChange={(e) => setFormData({ ...formData, availableEquipment: e.target.value as EquipmentChoice })}
                    className="w-full mt-1.5 bg-surface-container border border-border/80 rounded-xl px-4 py-3 text-sm text-text-primary outline-none"
                  >
                    <option value="FULL_GYM">Full Gym (Barbells, Cables, Machines)</option>
                    <option value="DUMBBELLS">Dumbbells & Adjustable Bench</option>
                    <option value="BODYWEIGHT">Bodyweight Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-text-secondary uppercase">Session Duration</label>
                  <select
                    value={formData.preferredDurationMin}
                    onChange={(e) => setFormData({ ...formData, preferredDurationMin: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-surface-container border border-border/80 rounded-xl px-4 py-3 text-sm text-text-primary outline-none"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-text-secondary uppercase">Days Per Week</label>
                  <select
                    value={formData.trainingDaysPerWeek}
                    onChange={(e) => setFormData({ ...formData, trainingDaysPerWeek: Number(e.target.value) })}
                    className="w-full mt-1.5 bg-surface-container border border-border/80 rounded-xl px-4 py-3 text-sm text-text-primary outline-none"
                  >
                    <option value={2}>2 Days / Week</option>
                    <option value={3}>3 Days / Week</option>
                    <option value={4}>4 Days / Week</option>
                    <option value={5}>5 Days / Week</option>
                    <option value={6}>6 Days / Week</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
               STEP 6: REVIEW & CONFIRMATION
               =================================================================== */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-text-primary">Step 6 — Review Profile Summary</h3>
                  <p className="text-xs text-text-secondary">Confirm your parameters before saving to PostgreSQL.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-surface-container/60 p-3.5 rounded-xl border border-border/40">
                  <span className="text-[10px] text-text-muted uppercase">Age / Height / Weight</span>
                  <p className="font-bold text-text-primary mt-1">{formData.age} yrs • {formData.heightCm}cm • {formData.weightKg}kg</p>
                  <button onClick={() => setCurrentStep(1)} className="text-primary text-[10px] underline mt-2 block">Edit Step 1</button>
                </div>

                <div className="bg-surface-container/60 p-3.5 rounded-xl border border-border/40">
                  <span className="text-[10px] text-text-muted uppercase">Fitness Level</span>
                  <p className="font-bold text-text-primary mt-1">{formData.fitnessLevel}</p>
                  <button onClick={() => setCurrentStep(2)} className="text-primary text-[10px] underline mt-2 block">Edit Step 2</button>
                </div>

                <div className="bg-surface-container/60 p-3.5 rounded-xl border border-border/40">
                  <span className="text-[10px] text-text-muted uppercase">Activity Level</span>
                  <p className="font-bold text-text-primary mt-1">{formData.activityLevel.replace('_', ' ')}</p>
                  <button onClick={() => setCurrentStep(3)} className="text-primary text-[10px] underline mt-2 block">Edit Step 3</button>
                </div>

                <div className="bg-surface-container/60 p-3.5 rounded-xl border border-border/40">
                  <span className="text-[10px] text-text-muted uppercase">Primary Goal</span>
                  <p className="font-bold text-gold mt-1">{formData.primaryGoal}</p>
                  <button onClick={() => setCurrentStep(4)} className="text-primary text-[10px] underline mt-2 block">Edit Step 4</button>
                </div>

                <div className="bg-surface-container/60 p-3.5 rounded-xl border border-border/40 col-span-2">
                  <span className="text-[10px] text-text-muted uppercase">Preferences</span>
                  <p className="font-bold text-text-primary mt-1">
                    {formData.workoutLocation} • {formData.availableEquipment.replace('_', ' ')} • {formData.preferredDurationMin}m • {formData.trainingDaysPerWeek} days/wk
                  </p>
                  <button onClick={() => setCurrentStep(5)} className="text-primary text-[10px] underline mt-2 block">Edit Step 5</button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Control Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-border/40">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-surface-container border border-border text-xs font-mono font-medium text-text-secondary disabled:opacity-40 hover:text-text-primary transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl btn-hunter-primary font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-success to-emerald-600 text-background font-display font-bold text-sm shadow-[0_0_20px_rgba(34,197,94,0.35)] hover:opacity-95 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Complete Profile & Enter Dashboard
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
