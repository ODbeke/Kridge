/** @type {import("tailwindcss").Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
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
      }
    },
  },
  plugins: [],
};
