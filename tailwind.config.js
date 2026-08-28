/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        black: "#000000",
        night: "#09090B",
        carbon: "#121216",
        surface: "#18181B",
        purple: {
          DEFAULT: "#A855F7",
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#581C87",
          950: "#3B0764",
        },
        steel: "#94A3B8",
        graphite: "#71717A",
        space: "#A1A1AA",
        emerald: {
          DEFAULT: "#10B981",
          400: "#34D399",
          500: "#10B981",
          900: "#064E3B",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Space Mono", "monospace"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "marquee": "marquee 35s linear infinite",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 10px rgba(168, 85, 247, 0.7))" },
          "50%": { opacity: "0.5", filter: "drop-shadow(0 0 3px rgba(168, 85, 247, 0.3))" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.08)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.08)" },
          "70%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
