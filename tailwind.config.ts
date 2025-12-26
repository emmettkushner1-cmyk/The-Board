import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "board-black": "#0b0b0f",
        "board-purple": "#6d5dfc",
        "board-gold": "#f4b400"
      }
    }
  },
  plugins: []
};

export default config;
