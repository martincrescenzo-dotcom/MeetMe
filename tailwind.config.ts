import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: "#f5f1e8",
        ink: "#1a1a1a",
        muted: "#6b6b6b",
      },
      fontFamily: {
        mono: ['"Courier New"', "Courier", "monospace"],
      },
      maxWidth: {
        mobile: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
