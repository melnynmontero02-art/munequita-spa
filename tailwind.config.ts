import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme
        skin:     "#0a0807",   // main bg — very dark warm black
        cream:    "#110e0c",   // alternate section bg
        snow:     "#1a1512",   // card bg
        charcoal: "#f0ebe4",   // primary text — warm ivory
        muted:    "#9a9088",   // secondary text
        // Accent palette
        blush:    "#f2c4d8",
        rose:     "#d4618c",
        "rose-deep": "#a83468",
        petal:    "#2a1520",
        // Ink for overlays
        ink:      "#080808",
        "ink-2":  "#0f0f0f",
        "ink-3":  "#181818",
      },
      fontFamily: {
        brand:   ["'Cinzel'",              "Georgia", "serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans:    ["var(--font-inter)",     "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up":    { "0%": { opacity:"0", transform:"translateY(40px)" }, "100%": { opacity:"1", transform:"translateY(0)" } },
        float:        { "0%,100%": { transform:"translateY(0px)" }, "50%": { transform:"translateY(-14px)" } },
        "pulse-ring": { "0%": { transform:"scale(1)", opacity:"0.5" }, "100%": { transform:"scale(1.9)", opacity:"0" } },
      },
      animation: {
        "fade-up":    "fade-up 0.8s ease forwards",
        float:        "float 7s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.2s cubic-bezier(0.215,0.61,0.355,1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
