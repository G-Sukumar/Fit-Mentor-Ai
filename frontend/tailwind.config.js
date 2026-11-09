/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#050912",
        navy: "#081225",
        "navy-elevated": "#0B1730",
        sidebar: "rgba(8, 18, 37, 0.92)",
        surface: "rgba(8, 18, 37, 0.8)",
        "surface-elevated": "rgba(11, 23, 48, 0.9)",
        "surface-container": "rgba(14, 27, 54, 0.65)",
        primary: "#22D3EE", // Cyan
        "electric-blue": "#3B82F6", // Electric Blue
        secondary: "#8B5CF6", // Violet
        gold: "#D4AF6A", // Achievement Gold
        "soft-white": "#F1F5FF",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        border: "rgba(59, 130, 246, 0.2)",
        "border-glow": "rgba(34, 211, 238, 0.35)",
        "border-violet": "rgba(139, 92, 246, 0.35)",
        "text-primary": "#F1F5FF",
        "text-secondary": "#94A3B8",
        "text-muted": "#64748B"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Geist'", "'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      boxShadow: {
        "hunter-glow": "0 0 25px rgba(59, 130, 246, 0.25)",
        "cyan-glow": "0 0 20px rgba(34, 211, 238, 0.3)",
        "violet-glow": "0 0 20px rgba(139, 92, 246, 0.3)",
        "gold-glow": "0 0 20px rgba(212, 175, 106, 0.3)",
      }
    },
  },
  plugins: [],
}
