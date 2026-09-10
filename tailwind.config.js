/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#66717d",
        line: "#dfe5ea",
        canvas: "#f4f6f8",
        brand: {
          DEFAULT: "#7c941a",
          dark: "#566a0b",
          soft: "#eef5d8"
        }
      },
      boxShadow: {
        panel: "0 10px 30px rgba(23, 32, 42, 0.06)"
      }
    }
  },
  plugins: []
};
