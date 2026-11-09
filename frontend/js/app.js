/**
 * FitMentor AI — Interactive Frontend Engine
 * Powered by Google Stitch (Project 16575783439607592046)
 */

document.addEventListener('DOMContentLoaded', () => {
  initWebGLBackground();
  initNavigation();
  initAICoachChat();
  initWorkoutModal();
  initNutritionTracker();
  initMilestones();
  initTelemetrySync();
});

/* =========================================================================
   1. WebGL Atmospheric Particle & Ambient Shader (Stitch Integration)
   ========================================================================= */
function initWebGLBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  function syncSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  window.addEventListener('resize', syncSize);
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('WebGL not supported, falling back to static background.');
    return;
  }

  const vsSource = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    void main() {
      vec2 uv = v_texCoord;
      vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      
      // Premium Midnight Navy Base
      vec3 color = vec3(0.0196, 0.0353, 0.0706);
      
      // Soft Atmospheric Glows
      float upperGlow = smoothstep(1.0, 0.0, uv.y + 0.2);
      color += vec3(0.831, 0.686, 0.416) * (upperGlow * 0.05); 
      
      float sideGlow = smoothstep(0.5, 0.0, abs(uv.x - 0.5));
      color += vec3(0.133, 0.827, 0.933) * (sideGlow * 0.03);

      // Crystalline Floating Particles
      for(float i = 0.0; i < 32.0; i++) {
        float h = hash(vec2(i, 789.12));
        float speed = 0.03 + h * 0.07;
        
        vec2 pos = vec2(
          fract(h * 123.45 + u_time * speed * 0.05) * 2.4 - 1.2,
          fract(h * 456.78 + u_time * speed * 0.03) * 2.4 - 1.2
        );
        
        float centerDist = length(pos);
        float mask = smoothstep(0.2, 0.6, centerDist);
        
        float size = 0.0015 + h * 0.003;
        float dist = length(p - pos);
        
        float alpha = smoothstep(size + 0.01, size, dist) * (0.2 + 0.8 * sin(u_time * 0.4 + h * 6.28));
        
        vec3 pCol = vec3(1.0);
        if(h < 0.3) pCol = vec3(0.133, 0.827, 0.933);      // Cyan
        else if(h < 0.6) pCol = vec3(0.831, 0.686, 0.416); // Gold
        else pCol = vec3(0.545, 0.361, 0.965);             // AI Violet
        
        color += pCol * alpha * 0.35 * mask;
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function createShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = createShader(gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = canvas.height - e.clientY;
  });

  function render(t) {
    syncSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* =========================================================================
   2. Navigation & View Switching
   ========================================================================= */
function initNavigation() {
  const navLinks = document.querySelectorAll('[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute('data-tab');

      // Update Nav active style
      navLinks.forEach(l => {
        l.classList.remove('text-primary', 'font-bold', 'bg-surface-elevated', 'border-l-4', 'border-primary');
        l.classList.add('text-text-secondary');
      });
      link.classList.add('text-primary', 'font-bold', 'bg-surface-elevated', 'border-l-4', 'border-primary');
      link.classList.remove('text-text-secondary');

      // Show Tab
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${targetTab}`) {
          content.classList.add('active');
        }
      });
    });
  });
}

/* =========================================================================
   3. Interactive Conversational AI Coach
   ========================================================================= */
function initAICoachChat() {
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-input');
  const chatMessages = document.getElementById('ai-chat-messages');
  const quickPrompts = document.querySelectorAll('.quick-prompt-btn');

  if (!chatForm || !chatInput || !chatMessages) return;

  const smartResponses = {
    "recovery": "Your composite Readiness Score is **85/100 (Optimal)**. Your autonomic nervous system recovery is at 92% with 7h 20m of deep and REM sleep. You are primed for high-intensity power hypertrophy or progressive overload training today!",
    "workout": "For today's Upper Body Power session, start with **Barbell Bench Press** (4 sets x 6 reps at 80% 1RM), followed by **Incline Dumbbell Rows** (4 sets x 8 reps), and **Overhead Shoulder Press** (3 sets x 8 reps). Keep rest intervals between 90–120 seconds.",
    "protein": "Based on your 78kg body weight and hypertrophy goal, your target is **160g of protein daily**. So far you've logged 112g. A high-protein dinner like 200g grilled salmon with quinoa or a double scoop whey shake will comfortably hit your target!",
    "posture": "When performing deadlifts or squats, maintain neutral cervical spine alignment. Avoid looking up at the mirror to prevent hyperextension. Engage your lats by imagining 'bending the bar' around your shins before the pull.",
    "default": "I'm analyzing your current telemetry: Heart rate is stable at 62 BPM, and weekly volume adherence is at 88%. How can I help refine your training or nutrition right now?"
  };

  function appendMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = isUser 
      ? "flex justify-end mb-4 animate-fade-in" 
      : "flex justify-start mb-4 animate-fade-in";

    msgDiv.innerHTML = isUser
      ? `<div class="bg-primary/20 border border-primary/40 text-text-primary px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[80%] text-sm">
           ${text}
         </div>`
      : `<div class="flex gap-3 max-w-[85%]">
           <div class="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[0_0_10px_rgba(139,92,246,0.5)]">
             <span class="material-symbols-outlined text-xs">neurology</span>
           </div>
           <div class="bg-surface-elevated border border-secondary/30 text-text-primary px-4 py-3 rounded-2xl rounded-tl-none text-sm leading-relaxed shadow-lg">
             ${text}
           </div>
         </div>`;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleSend(promptText) {
    const text = promptText || chatInput.value.trim();
    if (!text) return;

    appendMessage(text, true);
    if (!promptText) chatInput.value = '';

    // Simulate typing
    const typingIndicator = document.createElement('div');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.className = 'flex items-center gap-2 text-text-secondary text-xs mb-4 ml-10';
    typingIndicator.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span> FitMentor AI is thinking...`;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      typingIndicator.remove();
      const lower = text.toLowerCase();
      let response = smartResponses.default;
      if (lower.includes('recover') || lower.includes('ready') || lower.includes('score')) {
        response = smartResponses.recovery;
      } else if (lower.includes('workout') || lower.includes('exercise') || lower.includes('routine')) {
        response = smartResponses.workout;
      } else if (lower.includes('protein') || lower.includes('food') || lower.includes('eat') || lower.includes('nutrition') || lower.includes('calorie')) {
        response = smartResponses.protein;
      } else if (lower.includes('form') || lower.includes('posture') || lower.includes('squat') || lower.includes('bench')) {
        response = smartResponses.posture;
      }
      appendMessage(response, false);
    }, 600);
  }

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend();
  });

  quickPrompts.forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      handleSend(prompt);
    });
  });
}

/* =========================================================================
   4. Live Interactive Workout Session & Timer
   ========================================================================= */
let workoutTimer = null;
let workoutSeconds = 1845; // Start at 30m 45s for demo

function initWorkoutModal() {
  const modal = document.getElementById('workout-modal');
  const openButtons = document.querySelectorAll('.btn-start-workout');
  const closeButton = document.getElementById('close-workout-modal');
  const toggleTimerBtn = document.getElementById('toggle-timer-btn');
  const timerDisplay = document.getElementById('modal-timer-display');
  const completeBtn = document.getElementById('complete-workout-btn');

  if (!modal) return;

  function updateTimerText() {
    const mins = Math.floor(workoutSeconds / 60).toString().padStart(2, '0');
    const secs = (workoutSeconds % 60).toString().padStart(2, '0');
    if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
  }

  function startTimer() {
    if (workoutTimer) return;
    workoutTimer = setInterval(() => {
      workoutSeconds++;
      updateTimerText();
    }, 1000);
    if (toggleTimerBtn) {
      toggleTimerBtn.innerHTML = `<span class="material-symbols-outlined text-sm">pause</span> Pause`;
      toggleTimerBtn.classList.replace('bg-primary', 'bg-warning');
    }
  }

  function pauseTimer() {
    clearInterval(workoutTimer);
    workoutTimer = null;
    if (toggleTimerBtn) {
      toggleTimerBtn.innerHTML = `<span class="material-symbols-outlined text-sm">play_arrow</span> Resume`;
      toggleTimerBtn.classList.replace('bg-warning', 'bg-primary');
    }
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modal.classList.remove('hidden');
      startTimer();
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      modal.classList.add('hidden');
      pauseTimer();
    });
  }

  if (toggleTimerBtn) {
    toggleTimerBtn.addEventListener('click', () => {
      if (workoutTimer) pauseTimer();
      else startTimer();
    });
  }

  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      pauseTimer();
      alert('🎉 Phenomenal Workout! Session logged with 480 kcal burned and 100% volume target completed.');
      modal.classList.add('hidden');
    });
  }

  // Set checklists
  const checkItems = document.querySelectorAll('.exercise-check');
  checkItems.forEach(box => {
    box.addEventListener('change', (e) => {
      const parent = e.target.closest('.exercise-row');
      if (parent) {
        if (e.target.checked) {
          parent.classList.add('opacity-50', 'line-through');
        } else {
          parent.classList.remove('opacity-50', 'line-through');
        }
      }
    });
  });
}

/* =========================================================================
   5. Dynamic Nutrition & Hydration Tracker
   ========================================================================= */
function initNutritionTracker() {
  let waterConsumed = 2250; // ml
  const waterTarget = 3500;
  const waterDisplay = document.getElementById('water-count-display');
  const waterProgress = document.getElementById('water-progress-bar');
  const add250Btn = document.getElementById('add-water-250');
  const add500Btn = document.getElementById('add-water-500');

  function updateWater() {
    if (waterDisplay) waterDisplay.textContent = `${(waterConsumed / 1000).toFixed(2)}L`;
    if (waterProgress) {
      const pct = Math.min(100, Math.round((waterConsumed / waterTarget) * 100));
      waterProgress.style.width = `${pct}%`;
    }
  }

  if (add250Btn) {
    add250Btn.addEventListener('click', () => {
      waterConsumed += 250;
      updateWater();
    });
  }

  if (add500Btn) {
    add500Btn.addEventListener('click', () => {
      waterConsumed += 500;
      updateWater();
    });
  }
}

/* =========================================================================
   6. Milestone & Streak Interactivity
   ========================================================================= */
function initMilestones() {
  const streakBadge = document.getElementById('streak-banner');
  if (streakBadge) {
    streakBadge.addEventListener('click', () => {
      alert('🔥 7-Day Consistency Streak! You are in the top 5% of active lifters this week.');
    });
  }
}

/* =========================================================================
   7. Wearable Sync Simulation
   ========================================================================= */
function initTelemetrySync() {
  const syncBtn = document.getElementById('sync-wearable-btn');
  const syncStatusText = document.getElementById('sync-status-time');

  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      syncBtn.classList.add('animate-spin');
      setTimeout(() => {
        syncBtn.classList.remove('animate-spin');
        if (syncStatusText) syncStatusText.textContent = 'Synced just now';
        alert('⌚ Telemetry Synced! 12,400 steps and 62 BPM resting heart rate updated.');
      }, 700);
    });
  }
}
