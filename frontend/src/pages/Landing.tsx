import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Sparkles, 
  Activity, 
  Camera, 
  Zap, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  ChevronRight,
  Dumbbell,
  Quote,
  Trophy,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FitMentorShieldEmblem } from '../components/ui/HunterBadges';

import heroBg from '../assets/images/hero_bg.jpg';
import biometricsHudImg from '../assets/images/biometrics_hud.jpg';
import poseCvAlignmentImg from '../assets/images/card2_pose_cv.jpg';
import barbellTelemetryImg from '../assets/images/card3_barbell_telemetry.jpg';
import legendArnoldImg from '../assets/images/legend_arnold.jpg';
import legendKobeImg from '../assets/images/legend_kobe.jpg';
import legendAliImg from '../assets/images/legend_ali.jpg';
import logoImg from '../assets/images/logo.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const benefits = [
    {
      id: 'biometric-hud',
      title: 'REAL-TIME BIOMETRICS & READINESS',
      desc: 'Instantly monitor heart rate zones, HRV recovery indices, and daily readiness scores on a futuristic HUD interface engineered for total training optimization.',
      image: biometricsHudImg,
      icon: Activity,
      tag: 'Live Telemetry',
    },
    {
      id: 'pose-alignment',
      title: 'COMPUTER VISION POSE ALIGNMENT',
      desc: 'Local MediaPipe computer vision measures joint angles, squat depth (92°), and spinal neutrality in real-time without sending video feed to external cloud servers.',
      image: poseCvAlignmentImg,
      icon: Camera,
      tag: '3D Form Check',
    },
    {
      id: 'barbell-telemetry',
      title: 'LIVE ATHLETIC PERFORMANCE & LOAD TRACKING',
      desc: 'Track barbell velocity (0.65 m/s), muscle activation (Quads 92%, Glutes 88%), and rep-by-rep power output to maximize strength gains safely.',
      image: barbellTelemetryImg,
      icon: Zap,
      tag: 'Velocity & Muscle HUD',
    },
  ];

  const legends = [
    {
      id: 'arnold-schwarzenegger',
      name: 'Arnold Schwarzenegger',
      subtitle: '7x Mr. Olympia & Global Fitness Titan',
      tag: 'Iron Discipline',
      badge: 'Unbroken Vision',
      image: legendArnoldImg,
      storyLine1: 'Arriving in America with nothing but relentless hunger, Arnold transformed bodybuilding into a global cultural phenomenon through iron discipline.',
      storyLine2: 'He obliterated every perceived ceiling across world championships and Hollywood, proving that unshakeable belief outworks any limitation.',
      quote: 'The mind is the limit. As long as the mind can envision the fact that you can do something, you can do it, as long as you really believe 100 percent.',
      mindsetTheme: 'Vision & Willpower'
    },
    {
      id: 'kobe-bryant',
      name: 'Kobe Bryant',
      subtitle: '5x NBA Champion & Olympic Gold Medalist',
      tag: 'Mamba Mentality',
      badge: 'Relentless Craft',
      image: legendKobeImg,
      storyLine1: 'Renowned for legendary 4:00 AM training sessions and obsessive perfection, Kobe turned relentless preparation into five championship rings.',
      storyLine2: 'His Mamba Mentality taught that greatness is not born from talent, but forged in the lonely hours when the stadium is dark and no one is watching.',
      quote: 'I have self-doubt. I have insecurity. I have fear of failure. But you don\'t let those things hold you back—you embrace them and dominate anyway.',
      mindsetTheme: 'Obsessive Work Ethic'
    },
    {
      id: 'muhammad-ali',
      name: 'Muhammad Ali',
      subtitle: '3x World Heavyweight Champion & Icon',
      tag: 'Champion Spirit',
      badge: 'Indomitable Courage',
      image: legendAliImg,
      storyLine1: 'Muhammad Ali revolutionized boxing with blistering speed, electric confidence, and unyielding conviction both inside and outside the ring.',
      storyLine2: 'He embraced brutal suffering in dark, gritty gyms long before dancing under championship lights, setting the benchmark for what it means to be "The Greatest."',
      quote: 'I hated every minute of training, but I said, "Don\'t quit. Suffer now and live the rest of your life as a champion."',
      mindsetTheme: 'Relentless Courage'
    }
  ];

  return (
    <div className="min-h-screen relative flex flex-col bg-[#070a11] text-text-primary selection:bg-rose-500 selection:text-white font-body">
      
      {/* SECTION 1: HERO WITH ATHLETE BACKGROUND */}
      <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-black">
        {/* Full-screen Background Image with Dark Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Professional Fitness Athlete Workout" 
            className="w-full h-full object-cover object-center filter brightness-90 saturate-[1.1]"
          />
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        </div>

        {/* Top Header Navigation */}
        <header className="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <FitMentorShieldEmblem size={40} />
            <h1 className="text-xl sm:text-2xl font-display font-extrabold uppercase tracking-tight text-white flex items-center gap-1.5">
              FITMENTOR<span className="text-cyan">AI</span>
            </h1>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-6">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-white hover:text-cyan transition-colors"
            >
              LOGIN
            </Link>
            <Link
              to="/dashboard"
              className="btn-hunter-primary font-display font-bold text-xs sm:text-sm uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-hunter-glow transition-all"
            >
              {isAuthenticated ? 'MY DASHBOARD' : 'AWAKEN NOW'}
            </Link>
          </div>
        </header>

        {/* Hero Body Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-12 flex-1 flex flex-col justify-center text-left">
          <div className="max-w-2xl space-y-4">
            {/* Signature Script Accent */}
            <span className="font-['Caveat',cursive] text-4xl sm:text-6xl text-rose-500 block -rotate-3 origin-left tracking-wide drop-shadow-[0_0_20px_rgba(244,63,94,0.5)] font-bold">
              Insanely
            </span>

            {/* Giant Impact All-Caps Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-extrabold uppercase text-white tracking-tight leading-[0.95] drop-shadow-2xl">
              ACHIEVABLE <br />
              HOME <br />
              WORKOUTS
            </h1>

            {/* Motivational Subtitle Quote */}
            <p className="text-base sm:text-xl text-gray-300 font-light leading-relaxed pt-2 max-w-lg">
              Work out from anywhere; your AI trainer is always with you!
            </p>

            {/* Learn More Button */}
            <div className="pt-6">
              <button
                onClick={() => {
                  const target = document.getElementById('benefits-section');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-2 border-white/80 hover:border-rose-500 hover:bg-rose-600/20 text-white font-display font-bold uppercase tracking-widest px-8 py-3.5 text-sm transition-all shadow-xl hover:scale-[1.03] backdrop-blur-sm cursor-pointer"
              >
                LEARN MORE
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 py-6 text-center text-gray-400 text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-2">
          <span>SCROLL TO EXPLORE</span>
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        </div>
      </section>

      {/* SECTION 2: BENEFITS OF INSANELY POWERFUL HOME WORKOUTS */}
      <section id="benefits-section" className="w-full bg-white text-slate-900 py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-left space-y-1">
            <span className="font-['Caveat',cursive] text-3xl sm:text-5xl text-rose-500 block font-bold">
              Benefits of Insanely Powerful
            </span>
            <h2 className="text-4xl sm:text-6xl font-display font-extrabold uppercase text-slate-900 tracking-tight leading-none">
              HOME WORKOUTS
            </h2>
          </div>

          {/* 3-Column Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {benefits.map((b) => (
              <div 
                key={b.id} 
                className="flex flex-col group cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 shadow-md mb-6 group-hover:shadow-2xl transition-all duration-300">
                  <img 
                    src={b.image} 
                    alt={b.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                    {b.tag}
                  </div>
                </div>

                {/* Card Title & Text */}
                <div className="space-y-2 text-left">
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold uppercase text-slate-900 tracking-tight group-hover:text-rose-600 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-normal leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: INSPIRATIONAL STORIES OF THREE LEGENDS */}
      <section className="w-full bg-[#080c16] py-24 px-6 lg:px-12 border-t border-border/60 relative overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-rose-600/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-mono tracking-widest uppercase">
              <Trophy className="w-3.5 h-3.5 text-rose-400" />
              HALL OF LEGENDARY MINDSETS
            </div>
            <span className="font-['Caveat',cursive] text-4xl sm:text-6xl text-rose-500 block font-bold -rotate-1">
              Fuel Your Inner Fire
            </span>
            <h2 className="text-4xl sm:text-6xl font-display font-extrabold uppercase text-white tracking-tight leading-none">
              WISDOM OF THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400">LEGENDS</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-300 font-light max-w-2xl mx-auto pt-2 leading-relaxed">
              Every breakthrough begins in the mind. Draw daily inspiration from the unbreakable discipline, obsessive craft, and indomitable courage of three icons who conquered the world.
            </p>
          </div>

          {/* 3 Legends Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {legends.map((legend) => (
              <div
                key={legend.id}
                className="group relative flex flex-col justify-between bg-surface-elevated/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-rose-500/50 hover:shadow-[0_15px_40px_rgba(244,63,94,0.18)] transition-all duration-300"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
                  <img
                    src={legend.image}
                    alt={legend.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1626] via-transparent to-black/50" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/85 backdrop-blur-md text-white font-mono text-[10px] uppercase font-bold tracking-wider border border-white/20 flex items-center gap-1.5 shadow-lg">
                      <Crown className="w-3 h-3 text-amber-400" />
                      {legend.tag}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/90 text-white font-mono text-[10px] uppercase font-bold tracking-wider shadow-lg">
                      {legend.badge}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
                  {/* Legend Header */}
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-extrabold uppercase text-white tracking-tight group-hover:text-rose-400 transition-colors">
                      {legend.name}
                    </h3>
                    <p className="text-xs font-mono text-rose-400 tracking-wide font-medium">
                      {legend.subtitle}
                    </p>
                  </div>

                  {/* 2-Line Motivational Story */}
                  <div className="space-y-2.5 bg-black/40 p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold">
                      INSPIRATIONAL STORY
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                        {legend.storyLine1}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                      <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                        {legend.storyLine2}
                      </p>
                    </div>
                  </div>

                  {/* Powerful Mindset Quote */}
                  <div className="relative p-5 rounded-xl bg-gradient-to-br from-black/90 to-surface/90 border border-rose-500/25 group-hover:border-rose-500/50 transition-colors space-y-3 shadow-inner">
                    <Quote className="w-6 h-6 text-rose-500/70" />
                    <blockquote className="text-sm italic font-display text-white font-normal leading-relaxed">
                      "{legend.quote}"
                    </blockquote>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-gray-400 uppercase tracking-wider">Mindset Pillar</span>
                      <span className="text-rose-400 font-bold uppercase tracking-wider">{legend.mindsetTheme}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Motivation Callout Banner */}
          <div className="glass-card border border-rose-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-rose-950/40 via-surface-elevated/85 to-black">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-display font-extrabold uppercase text-white flex items-center justify-center sm:justify-start gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                Channel Their Greatness Into Today's Session
              </h4>
              <p className="text-xs sm:text-sm text-gray-400 font-light">
                Champions aren't made in the comfort zone. Step up and execute your workout with AI precision.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="shrink-0 bg-rose-600 hover:bg-rose-500 text-white font-display font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-none shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <span>START TRAINING NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-border/50 bg-black px-6 lg:px-12 py-8 text-center sm:text-left">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logoImg} alt="FitMentor AI Logo" className="w-8 h-8 object-contain rounded-lg shadow-[0_0_12px_rgba(34,211,238,0.3)]" />
            <span className="font-display font-bold text-white text-sm tracking-wide">FITMENTOR AI</span>
          </div>
          <p className="text-xs text-gray-500 font-mono">
            &copy; {new Date().getFullYear()} FitMentor AI. Achievable Home Workouts & Athletic Intelligence.
          </p>
        </div>
      </footer>
    </div>
  );
};



