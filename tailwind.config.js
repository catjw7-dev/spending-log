/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      colors: {
        toss: {
          blue: "#3185FC",
          "blue-dark": "#1B6EF3",
          "blue-light": "#EBF3FE",
          green: "#00B493",
          "green-light": "#E5F7F4",
          red: "#F04452",
          "red-light": "#FEF0F1",
          yellow: "#F7C244",
          bg: "#F2F4F6",
          card: "#FFFFFF",
          text: "#131B23",
          "text-2": "#1E2A35",
          "text-3": "#2E3D4E",
          "text-4": "#8B95A1",
          "text-5": "#B0B8C1",
          border: "#E5E8EB",
        },
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
}