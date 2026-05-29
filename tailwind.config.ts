import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Palette is driven by CSS variables (RGB channel triplets) so the
        // whole site can switch themes by swapping the variables on <html>.
        // The `<alpha-value>` placeholder keeps Tailwind opacity modifiers
        // (e.g. bg-ink/60) working.
        ink:           "rgb(var(--c-ink) / <alpha-value>)",
        gold:          "rgb(var(--c-gold) / <alpha-value>)",
        brown:         "rgb(var(--c-brown) / <alpha-value>)",
        sand:          "rgb(var(--c-sand) / <alpha-value>)",
        "ink-2":       "rgb(var(--c-ink-2) / <alpha-value>)",
        "sand-2":      "rgb(var(--c-sand-2) / <alpha-value>)",
        "dark-bg":      "rgb(var(--c-dark-bg) / <alpha-value>)",
        "dark-surface": "rgb(var(--c-dark-surface) / <alpha-value>)",
        "dark-card":    "rgb(var(--c-dark-card) / <alpha-value>)",
        "dark-border":  "rgb(var(--c-dark-border) / <alpha-value>)",
      },
      fontFamily: {
        sans:    ["var(--font-body)", "Tajawal", "system-ui", "sans-serif"],
        display: ["var(--font-display-f)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 6px 24px -10px rgba(7,44,73,0.18)",
        card: "0 10px 30px -16px rgba(7,44,73,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
