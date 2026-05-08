/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Source Sans 3'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 50px -20px rgba(15, 23, 42, 0.3)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(251, 191, 36, 0.28), transparent 32%), radial-gradient(circle at top right, rgba(16, 185, 129, 0.18), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.94))",
      },
    },
  },
  plugins: [],
};

