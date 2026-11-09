import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { UserProfile, FitnessLevel, PrimaryGoal, ActivityLevel, WorkoutLocation, EquipmentChoice } from '../types/fitness';
import { 
  User, 
  Award, 
  Flame, 
  Scale, 
  Ruler, 
  HeartPulse, 
  Dumbbell, 
  Calendar, 
  Clock, 
  Target, 
  Watch, 
  Save, 
  Edit3, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  FileText,
  Activity,
  Sparkles
} from 'lucide-react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HunterLevelCrest } from '../components/ui/HunterBadges';
import { progressionService } from '../services/progressionService';
import { EquippedAvatarBadge } from '../components/ui/HunterAvatars';
import { HunterArmoryModal } from '../components/progression/HunterArmoryModal';

interface ProfileProps {
  user: UserProfile;
}

export const ProfilePage: React.FC<ProfileProps> = ({ user: initialUser }) => {
  const { updateUserProfileState } = useAuth();
  const location = useLocation();
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'biometrics' | 'training' | 'wearables' | 'account'>('biometrics');
  const [isArmoryOpen, setIsArmoryOpen] = useState(() => {
    return new URLSearchParams(location.search).get('tab') === 'armory';
  });

  const [progression, setProgression] = useState(() => 
    progressionService.computeProgression(
      user, 
      { score: 85, recoveryScore: 82, hrvScore: 88, sleepScore: 80, readinessStatus: 'OPTIMAL', restingHeartRate: 58 } as any, 
      { steps: { current: 8500, goal: 10000, percentage: 85 }, activeCalories: { current: 620, goal: 750, percentage: 82 }, sleepDuration: { hours: 7.5, goal: 8.0 }, heartRate: { resting: 58, current: 65, max: 175 } } as any, 
      []
    )
  );

  useEffect(() => {
    const handleProgressionUpdate = () => {
      setProgression(progressionService.computeProgression(
        user,
        { score: 85, recoveryScore: 82, hrvScore: 88, sleepScore: 80, readinessStatus: 'OPTIMAL', restingHeartRate: 58 } as any,
        { steps: { current: 8500, goal: 10000, percentage: 85 }, activeCalories: { current: 620, goal: 750, percentage: 82 }, sleepDuration: { hours: 7.5, goal: 8.0 }, heartRate: { resting: 58, current: 65, max: 175 } } as any,
        []
      ));
    };
    window.addEventListener('fitmentor_progression_updated', handleProgressionUpdate);
    return () => window.removeEventListener('fitmentor_progression_updated', handleProgressionUpdate);
  }, [user]);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('tab') === 'armory') {
      setIsArmoryOpen(true);
    }
  }, [location.search]);

  // Form State for Editing
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    age: user.age || 28,
    heightCm: user.heightCm || 178,
    weightKg: user.weightKg || 76,
    bodyFatPercentage: user.bodyFatPercentage || 15,
    fitnessLevel: user.fitnessLevel || 'INTERMEDIATE',
    primaryGoal: user.primaryGoal || 'HYPERTROPHY',
    activityLevel: user.activityLevel || 'MODERATELY_ACTIVE',
    workoutLocation: user.workoutLocation || 'GYM',
    availableEquipment: user.availableEquipment || 'FULL_GYM',
    trainingDaysPerWeek: user.trainingDaysPerWeek || 4,
    preferredDurationMin: user.preferredDurationMin || 60,
    wearableDevice: user.wearableDevice || 'Apple Watch Series 9',
    targetCalories: user.targetCalories || 2650
  });

  // Calculate Health Derived Metrics
  const heightM = formData.heightCm / 100;
  const bmi = heightM > 0 ? (formData.weightKg / (heightM * heightM)).toFixed(1) : '22.5';
  
  // BMR (Mifflin-St Jeor formula estimate)
  const bmr = Math.round(10 * formData.weightKg + 6.25 * formData.heightCm - 5 * formData.age + 5);
  
  // TDEE Multipliers
  const activityMultipliers: Record<ActivityLevel, number> = {
    SEDENTARY: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    MODERATELY_ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTREMELY_ACTIVE: 1.9
  };
  const tdee = Math.round(bmr * (activityMultipliers[formData.activityLevel] || 1.55));

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await apiService.updateProfile(formData);
      if (res && res.profile) {
        setUser(res.profile);
        updateUserProfileState(res.profile);
      } else {
        setUser(prev => ({ ...prev, ...formData }));
        updateUserProfileState(formData);
      }
      setIsEditing(false);
      setToastMessage('User information & biometric data updated successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      // Fallback local update
      setUser(prev => ({ ...prev, ...formData }));
      updateUserProfileState(formData);
      setIsEditing(false);
      setToastMessage('Profile updated in local session!');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-amber-400' };
    if (val < 25) return { label: 'Optimal / Athletic', color: 'text-emerald-400' };
    if (val < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'High Body Mass', color: 'text-rose-400' };
  };

  const bmiCat = getBmiCategory(parseFloat(bmi));

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Profile Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-surface-dark via-surface-container to-surface-dark border border-border/60 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <EquippedAvatarBadge 
                avatar={progression.equippedAvatar} 
                aura={progression.equippedAura} 
                size={84}
                onClick={() => setIsArmoryOpen(true)}
              />
              <span 
                className="absolute -bottom-1 -right-1 p-1 bg-cyan rounded-full border-2 border-surface-dark text-background shadow-[0_0_8px_rgba(34,211,238,0.8)] cursor-pointer" 
                title="Click to customize Hunter Armory" 
                onClick={() => setIsArmoryOpen(true)}
              >
                <Sparkles className="w-3.5 h-3.5 text-background" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-text-primary tracking-tight">
                  {user.fullName}
                </h1>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan/15 text-cyan border border-cyan/40 text-xs font-mono font-bold shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                  <HunterLevelCrest size={18} />
                  <span>{progression.hunterRank} • Lv. {progression.level}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan/15 text-cyan border border-cyan/40 flex items-center gap-1">
                  <span>#{progression.equippedAvatar.avatarRankNumber || 6}</span>
                  <span>{progression.equippedAvatar.name}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-gold border border-gold/40">
                  {progression.equippedTitle.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  {formData.primaryGoal.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-text-secondary flex items-center gap-2">
                <span>{user.email}</span>
                <span className="text-text-muted">•</span>
                <span className="font-mono text-xs text-text-muted">ID: {user.id ? user.id.slice(0, 8) : 'usr_8921'}</span>
              </p>

              <div className="flex items-center gap-4 pt-1 font-mono text-xs text-text-secondary">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Flame className="w-4 h-4 fill-current text-amber-400" />
                  <strong className="text-text-primary">{user.streakDays || 12} Day</strong> Streak
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Watch className="w-4 h-4 text-cyan-400" />
                  {formData.wearableDevice}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center flex-wrap">
            <button
              onClick={() => setIsArmoryOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              <Award className="w-4 h-4 text-cyan" />
              Hunter Armory
            </button>

            {isEditing ? (
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-background font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-xl bg-surface-container/80 hover:bg-surface-container border border-border/80 text-text-primary font-medium text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-cyan-400" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Biometric Snapshot Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-text-muted uppercase font-mono tracking-wider">Weight</span>
            <p className="text-xl font-bold font-mono text-text-primary">{formData.weightKg} <span className="text-xs text-text-secondary font-normal">kg</span></p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Ruler className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-text-muted uppercase font-mono tracking-wider">Height</span>
            <p className="text-xl font-bold font-mono text-text-primary">{formData.heightCm} <span className="text-xs text-text-secondary font-normal">cm</span></p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-text-muted uppercase font-mono tracking-wider">Est. Body Fat</span>
            <p className="text-xl font-bold font-mono text-text-primary">{formData.bodyFatPercentage}%</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-text-muted uppercase font-mono tracking-wider">Est. TDEE</span>
            <p className="text-xl font-bold font-mono text-text-primary">{tdee} <span className="text-xs text-text-secondary font-normal">kcal/d</span></p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border/60 gap-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab('biometrics')}
          className={`pb-4 transition-colors relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'biometrics' ? 'text-cyan-400 font-semibold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Activity className="w-4 h-4" />
          Physical & Biometrics
          {activeTab === 'biometrics' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`pb-4 transition-colors relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'training' ? 'text-cyan-400 font-semibold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          Training & Goals
          {activeTab === 'training' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('wearables')}
          className={`pb-4 transition-colors relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'wearables' ? 'text-cyan-400 font-semibold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Watch className="w-4 h-4" />
          Wearables & Nutrition
          {activeTab === 'wearables' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`pb-4 transition-colors relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'account' ? 'text-cyan-400 font-semibold' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <User className="w-4 h-4" />
          Account Bio-Data
          {activeTab === 'account' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: PHYSICAL & BIOMETRICS */}
      {activeTab === 'biometrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Fields Card */}
            <div className="glass-card p-6 rounded-2xl space-y-5">
              <h3 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
                <Scale className="w-5 h-5 text-cyan-400" />
                Physical Metrics
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1 uppercase">Age (years)</label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1 uppercase">Height (cm)</label>
                  <input
                    type="number"
                    disabled={!isEditing}
                    value={formData.heightCm}
                    onChange={(e) => handleInputChange('heightCm', parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1 uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    disabled={!isEditing}
                    value={formData.weightKg}
                    onChange={(e) => handleInputChange('weightKg', parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-muted mb-1 uppercase">Body Fat %</label>
                  <input
                    type="number"
                    step="0.5"
                    disabled={!isEditing}
                    value={formData.bodyFatPercentage}
                    onChange={(e) => handleInputChange('bodyFatPercentage', parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-muted mb-1 uppercase">Daily Activity Level</label>
                <select
                  disabled={!isEditing}
                  value={formData.activityLevel}
                  onChange={(e) => handleInputChange('activityLevel', e.target.value as ActivityLevel)}
                  className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
                >
                  <option value="SEDENTARY">Sedentary (Mostly sitting, desk job)</option>
                  <option value="LIGHTLY_ACTIVE">Lightly Active (Light walking, standing)</option>
                  <option value="MODERATELY_ACTIVE">Moderately Active (Moderate walking, on feet often)</option>
                  <option value="VERY_ACTIVE">Very Active (Active job, lots of movement)</option>
                  <option value="EXTREMELY_ACTIVE">Extremely Active (Heavy physical work, hard training)</option>
                </select>
              </div>
            </div>

            {/* Calculated Biometric Analytics Card */}
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Calculated Physiological Indexes
              </h3>

              <div className="space-y-4 font-mono">
                <div className="p-4 bg-surface-container/50 rounded-xl border border-border/40 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-text-muted block">BODY MASS INDEX (BMI)</span>
                    <span className="text-2xl font-bold text-text-primary">{bmi}</span>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-surface-dark ${bmiCat.color} border border-current/20`}>
                    {bmiCat.label}
                  </span>
                </div>

                <div className="p-4 bg-surface-container/50 rounded-xl border border-border/40 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-text-muted block">BASAL METABOLIC RATE (BMR)</span>
                    <span className="text-2xl font-bold text-text-primary">{bmr} <span className="text-xs font-normal text-text-secondary">kcal/day</span></span>
                  </div>
                  <span className="text-xs text-text-muted">Mifflin-St Jeor</span>
                </div>

                <div className="p-4 bg-surface-container/50 rounded-xl border border-cyan-500/30 bg-cyan-500/5 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-cyan-400 font-semibold block">TOTAL DAILY ENERGY (TDEE)</span>
                    <span className="text-2xl font-bold text-cyan-300">{tdee} <span className="text-xs font-normal text-cyan-400/80">kcal/day</span></span>
                  </div>
                  <span className="text-xs text-cyan-400/80">Target Maintenance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRAINING & GOALS */}
      {activeTab === 'training' && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-purple-400" />
            Training Parameters & AI Coach Grounding
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-text-muted mb-1.5 uppercase">Experience Level</label>
              <select
                disabled={!isEditing}
                value={formData.fitnessLevel}
                onChange={(e) => handleInputChange('fitnessLevel', e.target.value as FitnessLevel)}
                className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2.5 text-text-primary text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
              >
                <option value="BEGINNER">Beginner (&lt; 1 year structured training)</option>
                <option value="INTERMEDIATE">Intermediate (1 - 3 years progressive overload)</option>
                <option value="ADVANCED">Advanced (3+ years elite biomechanical programming)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-text-muted mb-1.5 uppercase">Primary Training Focus</label>
              <select
                disabled={!isEditing}
                value={formData.primaryGoal}
                onChange={(e) => handleInputChange('primaryGoal', e.target.value as PrimaryGoal)}
                className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2.5 text-text-primary text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
              >
                <option value="HYPERTROPHY">Hypertrophy (Muscle Growth & Volume)</option>
                <option value="FAT_LOSS">Fat Loss & Body Recomposition</option>
                <option value="STRENGTH">Maximal Strength (RPE 8-10 Progression)</option>
                <option value="ENDURANCE">Cardiovascular & Athletic Endurance</option>
                <option value="GENERAL_FITNESS">General Health & Vitality</option>
                <option value="RECOVERY">Active Recovery & Mobility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-text-muted mb-1.5 uppercase">Workout Environment</label>
              <select
                disabled={!isEditing}
                value={formData.workoutLocation}
                onChange={(e) => handleInputChange('workoutLocation', e.target.value as WorkoutLocation)}
                className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2.5 text-text-primary text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
              >
                <option value="GYM">Commercial Gym / Weight Room</option>
                <option value="HOME">Home Gym / Calisthenics Space</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-text-muted mb-1.5 uppercase">Equipment Availability</label>
              <select
                disabled={!isEditing}
                value={formData.availableEquipment}
                onChange={(e) => handleInputChange('availableEquipment', e.target.value as EquipmentChoice)}
                className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2.5 text-text-primary text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
              >
                <option value="FULL_GYM">Full Gym (Barbells, Cables, Machines)</option>
                <option value="DUMBBELLS">Dumbbells & Adjustable Bench Only</option>
                <option value="BODYWEIGHT">Bodyweight & Resistance Bands</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-text-muted mb-1.5 uppercase">Training Frequency (Days / Week)</label>
              <input
                type="number"
                min="1"
                max="7"
                disabled={!isEditing}
                value={formData.trainingDaysPerWeek}
                onChange={(e) => handleInputChange('trainingDaysPerWeek', parseInt(e.target.value) || 4)}
                className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2.5 text-text-primary font-mono text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-text-muted mb-1.5 uppercase">Target Session Duration (Minutes)</label>
              <input
                type="number"
                step="15"
                min="15"
                max="120"
                disabled={!isEditing}
                value={formData.preferredDurationMin}
                onChange={(e) => handleInputChange('preferredDurationMin', parseInt(e.target.value) || 60)}
                className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2.5 text-text-primary font-mono text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEARABLES & NUTRITION */}
      {activeTab === 'wearables' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl space-y-5">
              <h3 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
                <Watch className="w-5 h-5 text-cyan-400" />
                Wearable Integration Telemetry
              </h3>

              <div>
                <label className="block text-xs font-mono text-text-muted mb-1.5 uppercase">Active Wearable Sensor</label>
                <select
                  disabled={!isEditing}
                  value={formData.wearableDevice}
                  onChange={(e) => handleInputChange('wearableDevice', e.target.value)}
                  className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2.5 text-text-primary text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
                >
                  <option value="Apple Watch Series 9">Apple Watch Series 9 / Ultra</option>
                  <option value="Oura Ring Gen 3">Oura Ring Horizon Gen 3</option>
                  <option value="WHOOP 4.0">WHOOP Strap 4.0</option>
                  <option value="Garmin Fenix 7">Garmin Fenix 7 Pro / Epix</option>
                  <option value="Fitbit Sense 2">Fitbit Sense 2</option>
                </select>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-300">Biometric Sync Active</h4>
                    <p className="text-xs text-emerald-400/80">Receiving live HRV, sleep stages & resting heart rate</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-400">99.8% Uptime</span>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-5">
              <h3 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Daily Caloric & Macro Targets
              </h3>

              <div>
                <label className="block text-xs font-mono text-text-muted mb-1 uppercase">Target Caloric Intake (kcal)</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.targetCalories}
                  onChange={(e) => handleInputChange('targetCalories', parseInt(e.target.value) || 2000)}
                  className="w-full bg-surface-container/60 border border-border/80 rounded-xl px-3.5 py-2 text-text-primary font-mono text-sm focus:outline-none focus:border-cyan-400 disabled:opacity-75"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                  <span className="text-[10px] text-cyan-400 block uppercase">Protein</span>
                  <span className="text-base font-bold text-cyan-300">{Math.round(formData.weightKg * 2.2)}g</span>
                  <span className="text-[9px] text-text-muted block">30%</span>
                </div>

                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <span className="text-[10px] text-purple-400 block uppercase">Carbs</span>
                  <span className="text-base font-bold text-purple-300">{Math.round((formData.targetCalories * 0.45) / 4)}g</span>
                  <span className="text-[9px] text-text-muted block">45%</span>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <span className="text-[10px] text-amber-400 block uppercase">Fats</span>
                  <span className="text-base font-bold text-amber-300">{Math.round((formData.targetCalories * 0.25) / 9)}g</span>
                  <span className="text-[9px] text-text-muted block">25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACCOUNT BIO-DATA */}
      {activeTab === 'account' && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-display font-semibold text-text-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            System Account & Telemetry Data
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-sm">
            <div className="p-4 bg-surface-container/60 rounded-xl border border-border/40">
              <span className="text-xs text-text-muted block uppercase">Full Name</span>
              <span className="font-semibold text-text-primary">{user.fullName}</span>
            </div>

            <div className="p-4 bg-surface-container/60 rounded-xl border border-border/40">
              <span className="text-xs text-text-muted block uppercase">Account Email</span>
              <span className="font-semibold text-text-primary">{user.email}</span>
            </div>

            <div className="p-4 bg-surface-container/60 rounded-xl border border-border/40">
              <span className="text-xs text-text-muted block uppercase">Account ID</span>
              <span className="font-semibold text-text-primary">{user.id || 'usr_89214710293'}</span>
            </div>

            <div className="p-4 bg-surface-container/60 rounded-xl border border-border/40">
              <span className="text-xs text-text-muted block uppercase">Onboarding Status</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-dark border border-border/60 text-xs font-mono text-text-secondary space-y-2">
            <div className="flex justify-between">
              <span>Database Engine: PostgreSQL 16</span>
              <span className="text-emerald-400">Connected</span>
            </div>
            <div className="flex justify-between">
              <span>JWT Session Token Status: Valid</span>
              <span className="text-cyan-400">Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Hunter Armory & Avatar Customization Modal */}
      <HunterArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
        progression={progression}
        onEquipAvatar={(avatarId) => progressionService.equipAvatar(avatarId)}
        onEquipAura={(auraId) => progressionService.equipAura(auraId)}
        onEquipTitle={(titleId) => progressionService.equipTitle(titleId)}
        onSimulateLevelUp={() => progressionService.simulateLevelUp()}
      />
    </div>
  );
};

