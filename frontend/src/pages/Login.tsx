import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { FitMentorShieldEmblem } from '../components/ui/HunterBadges';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('sukumar@fitmentor.ai');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10 animate-fade-in">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full border border-border/80 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <FitMentorShieldEmblem size={52} className="mb-1" />
          <h2 className="text-2xl font-display font-bold text-text-primary">Hunter Login</h2>
          <p className="text-xs text-text-secondary">Sign in to sync your biometrics, quests, and AI coach telemetry.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 bg-surface-container/60 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-text-secondary uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 bg-surface-container/60 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl btn-hunter-primary text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Enter FitMentor Command Center'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-text-secondary">
          Don't have an account? <Link to="/register" className="text-primary hover:underline font-semibold">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/onboarding');
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10 animate-fade-in">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full border border-border/80 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <FitMentorShieldEmblem size={52} className="mb-1" />
          <h2 className="text-2xl font-display font-bold text-text-primary">Awaken Your Hunter Rank</h2>
          <p className="text-xs text-text-secondary">Register to initialize your personalized fitness RPG progression.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sukumar"
              required
              className="w-full mt-1 bg-surface-container/60 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sukumar@fitmentor.ai"
              required
              className="w-full mt-1 bg-surface-container/60 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full mt-1 bg-surface-container/60 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl btn-hunter-primary text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Account...
              </>
            ) : (
              'Continue to Onboarding'
            )}
          </button>
        </form>

        <div className="text-center text-xs text-text-secondary">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-semibold">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-10 animate-fade-in">
      <div className="glass-card rounded-2xl p-8 max-w-lg w-full border border-border/80 space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Athlete Profile Onboarding</h2>
          <p className="text-xs text-text-secondary mt-1">Configure your fitness goals and biometrics baseline.</p>
        </div>

        <div className="space-y-4 text-left">
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase">Primary Fitness Objective</label>
            <select className="w-full mt-1 bg-surface-container border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none">
              <option value="HYPERTROPHY">Muscle Hypertrophy & Strength</option>
              <option value="FAT_LOSS">Fat Loss & Conditioning</option>
              <option value="STRENGTH">Maximal Strength (Powerlifting)</option>
              <option value="ENDURANCE">Cardiovascular Endurance</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase">Height (cm)</label>
              <input type="number" defaultValue={178} className="w-full mt-1 bg-surface-container border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none" />
            </div>
            <div>
              <label className="text-xs font-mono text-text-secondary uppercase">Weight (kg)</label>
              <input type="number" defaultValue={78} className="w-full mt-1 bg-surface-container border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary outline-none" />
            </div>
          </div>
        </div>

        <button onClick={() => navigate('/dashboard')} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-background font-display font-bold text-sm shadow-lg hover:opacity-95 transition-all">
          Complete Profile Setup
        </button>
      </div>
    </div>
  );
};
