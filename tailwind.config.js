/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080B10",
        surface: "#0E131F",
        "surface-elevated": "#141B2D",
        border: "rgba(255, 255, 255, 0.08)",
        brand: {
          cyan: "#00F2FE",
          emerald: "#10B981",
          purple: "#8B5CF6",
          gold: "#F59E0B",
          rose: "#F43F5E"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      animation: {
        "pulse-glow": "pulseGlow 2.5s infinite ease-in-out",
        "shimmer": "shimmer 2.5s infinite linear",
        "float": "float 4s ease-in-out infinite"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.03)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        }
      }
    },
  },
  plugins: [],
};