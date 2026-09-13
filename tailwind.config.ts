import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-prompt)", "sans-serif"],
      },
      colors: {
        bg: "#0f1115",
        panel: "#171a21",
        panel2: "#1d2129",
        border: "#2a2f3a",
        accent: "#6ee7b7",
        accent2: "#60a5fa",
        text: "#e5e7eb",
        muted: "#9ca3af",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
