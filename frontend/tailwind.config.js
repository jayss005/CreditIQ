/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1B4FD8",
        surface: "#FFFFFF",
        background: "#F5F7FA",
        border: "#E2E8F0",
        heading: "#0F172A",
        body: "#475569",
        hint: "#94A3B8",
        success: {
          DEFAULT: "#16A34A",
          bg: "#DCFCE7",
          text: "#166534",
        },
        danger: {
          DEFAULT: "#DC2626",
          bg: "#FEE2E2",
          text: "#991B1B",
        },
        warning: {
          DEFAULT: "#D97706",
          bg: "#FEF9C3",
          text: "#854D0E",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        base: "14px",
      },
      borderRadius: {
        input: "8px",
        card: "12px",
        "card-lg": "16px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
      },
      maxWidth: {
        layout: "1100px",
      },
    },
  },
  plugins: [],
};
