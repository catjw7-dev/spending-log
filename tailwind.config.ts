import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        toss: {
          blue: "#3182F6",
          "blue-dark": "#1B6EF3",
          "blue-light": "#EBF3FE",
          green: "#00B493",
          "green-light": "#E5F7F4",
          red: "#F04452",
          "red-light": "#FEF0F1",
          yellow: "#F7C244",
          "yellow-light": "#FEF8E7",
          bg: "#F2F4F6",
          card: "#FFFFFF",
          text: "#191F28",
          "text-2": "#333D4B",
          "text-3": "#4E5968",
          "text-4": "#8B95A1",
          "text-5": "#B0B8C1",
          border: "#E5E8EB",
        },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
