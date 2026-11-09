# FitMentor AI — Design System & UI Specifications

> **Connected to Google Stitch Project**: `projects/16575783439607592046`  
> **Theme**: `Kinetic Horizon` (High-Fidelity Dark Mode)

---

## 1. Product Vision & Aesthetics

**FitMentor AI** is an intelligent personal fitness coaching platform that combines personalized workout programming, dynamic nutrition planning, real-time biometrics analytics, conversational AI coaching, computer vision exercise form analysis, and future smartwatch telemetry.

### Visual Style Core Principles
- **Atmospheric Dark Canvas**: Deep, immersive midnight tones (`#050912`) with subtle WebGL particles.
- **Glassmorphism & Depth**: Translucent surfaces (`rgba(17, 25, 37, 0.75)`) with backdrop blur (`blur(16px)`), refined 1px borders (`#263244`), and soft ambient glow.
- **High-End Health-Tech Feel**: Clean, sophisticated, high-contrast readability without gamer/neon clutter.
- **Micro-Animations & Feedback**: Smooth metric ring transitions, hover elevates, glowing focus rings, and active state highlights.

---

## 2. Color Palette & Tokens

### Primary & Accent Colors
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `primary` | `#22D3EE` | Primary action buttons, active tab indicators, key metric highlights |
| `primary-container` | `#00363E` | Subtle primary backgrounds, badges, and pill borders |
| `secondary` | `#8B5CF6` | AI Coach badge, intelligent insights, neural features |
| `gold` / `accent` | `#D4AF6A` | Premium streak milestones, trophies, recovery score badge |
| `success` | `#22C55E` | Goal completed, positive progress delta, nutrition macros on track |
| `warning` | `#F59E0B` | Hydration reminder, rest time alert, approaching limits |
| `error` | `#EF4444` | Form deviation alert, missed session, metric decrease |

### Surfaces & Backgrounds
| Token Name | Hex / RGBA | Usage |
| :--- | :--- | :--- |
| `background` | `#050912` | Deepest root background layer |
| `sidebar` | `rgba(8, 15, 25, 0.85)` | Sticky left navigation sidebar |
| `surface` | `rgba(16, 25, 37, 0.7)` | Standard dashboard cards, content containers |
| `surface-elevated` | `rgba(22, 34, 53, 0.85)` | Modals, dropdown menus, hovered cards |
| `border` | `#263244` | Subtle card borders, divider lines |
| `text-primary` | `#F8FAFC` | Main headings, key metrics, card titles |
| `text-secondary` | `#94A3B8` | Subtitles, labels, timestamps, metadata |
| `text-muted` | `#64748B` | Inactive icons, placeholder text |

---

## 3. Typography Hierarchy

| Style Token | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | Space Grotesk / Inter | 48px | 700 | 56px | -0.02em |
| `headline-lg` | Space Grotesk / Inter | 32px | 600 | 40px | -0.01em |
| `headline-md` | Space Grotesk / Inter | 24px | 600 | 32px | normal |
| `body-lg` | Geist / Inter | 18px | 400 | 28px | normal |
| `body-md` | Geist / Inter | 16px | 400 | 24px | normal |
| `body-sm` | Geist / Inter | 14px | 400 | 20px | normal |
| `label-caps` | JetBrains Mono / Inter | 12px | 600 | 16px | 0.05em (UPPERCASE) |
| `label-sm` | JetBrains Mono / Inter | 12px | 500 | 16px | normal |

---

## 4. Spacing System & Grid

- **Unit Base**: `8px`
- **Spacing Scale**:
  - `xs`: `4px`
  - `sm`: `8px`
  - `md`: `16px`
  - `lg`: `24px`
  - `xl`: `32px`
  - `2xl`: `48px`
- **Container Max Width**: `1440px`
- **Border Radius**:
  - Small / Badge: `6px`
  - Standard Cards: `14px`
  - Elevated Modals / Containers: `18px`
  - Circular / Pills: `9999px`

---

## 5. Screen Layout & Architecture

### Desktop Master Layout
```
+---------------------------------------------------------------------------------------------------+
|  [FitMentor AI]  | Top Navigation (Search, Date, Live Sync, Notification, Profile)               |
+------------------+--------------------------------------------------------------------------------+
|  [NAVIGATION]    | GREETING BANNER: "Good morning, Sukumar" - Health Score: 92/100 (Optimal)     |
|  - Dashboard     +--------------------------------------------------------------------------------+
|  - Workout       | METRICS STRIP: [Daily Steps: 8,420] [Calories: 640] [Sleep: 7h 45m] [BPM: 64]  |
|  - Nutrition     +--------------------------------------------------------------------------------+
|  - Progress      | MAIN GRID:                                                                     |
|  - AI Coach      | +-------------------------------+ +------------------------------------------+ |
|  - Challenges    | | Today's Workout Card          | | AI Intelligent Insight Panel             | |
|  - Analytics     | | Upper Body Hypertrophy (55m)  | | "Recovery is at 94%. Optimal day for PR" | |
|  - Settings      | | [Start Workout Button]        | | [Ask AI Coach Prompt]                    | |
|                  | +-------------------------------+ +------------------------------------------+ |
|                  | +-------------------------------+ +------------------------------------------+ |
|                  | | Weekly Consistency Chart      | | Nutrition & Macro Breakdown              | |
|                  | | Mon Tue Wed Thu Fri Sat Sun   | | Protein 160g / Carbs 210g / Fats 55g     | |
|                  | +-------------------------------+ +------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```
